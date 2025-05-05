import { useState, useEffect } from "react";
import { Button, Popover, Badge } from "antd";
import { BlockOutlined, FormOutlined, LoginOutlined, SettingOutlined, ContainerOutlined } from '@ant-design/icons';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { StarNewsFormData, useModal } from "@/hooks/use-modal";
import { StarredTitles, useStarredStore } from "@/store/starredStore";
import { useNavigate } from "react-router";
import { CHANGE_TITLE } from "@/graphql/mutation/ChangeTitle";
import { useMutation } from "@apollo/client";
import { useLoadTitlesIfSignedIn } from "@/hooks/use-loadTitlesIfSignedIn";

function AppSidebar({ onControlPanelToggle }: { onControlPanelToggle: () => void }) {
  const [isOpen, setIsOpen] = useState(true);
  const { starredTitles, clearUpdateFlag } = useStarredStore();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [changeTitle] = useMutation(CHANGE_TITLE);
  const { loadTitles } = useLoadTitlesIfSignedIn(); 

  const onSetClick = (e: StarredTitles) => {
    if (!e.titleId) {
      alert("请登录。");
    }
    useModal.getState().openModal({
      mode: 'edit',
      initialData: { ...e },
      onConfirm: async (formData: StarNewsFormData) => {
        try {
          await changeTitle ({
            variables: {
              titleMetaData: {
                ...formData,
                titleId: e.titleId,
                lastUpdatedAt: e.lastUpdatedAt,
              }
            }
          });
          loadTitles();
        } catch (error) {
          alert(error);
        }
    }});
  };

  const toggleSidebar = () => setIsOpen(!isOpen);

  useEffect(() => {
    setSelectedId(localStorage.getItem('lastSelectedId') || null);
  }, []);

  const onTitleClick = (titleId: string) => {
    setSelectedId(titleId);
    localStorage.setItem('lastSelectedId', titleId);
    clearUpdateFlag(titleId);
    navigate(`/${titleId}`);
  }

  const onBackClick = () => {
    setSelectedId(null);
    localStorage.removeItem('lastSelectedId');
    navigate("/")
  }

  const isToday = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };
  const todayUpdated = starredTitles.filter((e) => isToday(e.lastUpdatedAt));
  const older = starredTitles.filter((e) => !isToday(e.lastUpdatedAt));

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);

    // 初始时判断一次
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={`bg-indigo-50 p-4 transition-all duration-500 ease-in-out
    ${isOpen ? "basis-60 min-w-[240px]" : "w-16"} overflow-hidden flex flex-col`}>
      {/* 顶部开关 */}
      {isOpen && 
        <div className="flex flex-row justify-between align-middle">
          <Popover content="收起边栏" color="#f7f7f7">
            <Button onClick={toggleSidebar} type="text" size="large" icon={<BlockOutlined />} >
              <div className="text-indigo-500 font-bold">
                来龙去脉
              </div>
            </Button>
          </Popover>
          <SignedIn>
            <Popover content="返回主页" color="#f7f7f7">
              <ContainerOutlined 
                className="cursor-pointer px-2 py-2 rounded-xl hover:bg-gray-50" 
                onClick={() => onBackClick()}
                />
            </Popover>
          </SignedIn>
          <Popover content="创建新生成" color="#f7f7f7">
            <FormOutlined className="cursor-pointer px-2 py-2 rounded-xl hover:bg-gray-50" onClick={onControlPanelToggle}/>
          </Popover>
        </div>
      }
      {!isOpen && 
        <Popover content="打开边栏" color="#f7f7f7">
          <Button onClick={toggleSidebar} type="text" size="large" icon={<BlockOutlined />} >
          </Button>
        </Popover>
      }

      <Separator className="mt-3 mb-6"/>

      {/* 历史滚动列表 */}
       
      <ScrollArea className="flex-1 w-full"> 
        {isOpen &&
          <SignedIn>
            {<p className="font-bold text-indigo-400 text-sm mb-2">今日更新</p>}
            <ul className="ml-2">
              {todayUpdated.map((e) => (
                <div className={`flex justify-between cursor-pointer px-2 py-2 rounded-2xl 
                  hover:bg-gray-50 active:bg-gray-50 active:text-indigo-400
                  ${selectedId === e.titleId ? 'bg-gray-50 text-indigo-400' : 'text-gray-700'}`}
                >
                  <li className="text-sm" onClick={() => onTitleClick(e.titleId)}>
                    {e.title}
                  </li>
                  <div className="flex items-center gap-2">
                    {e.hasNew && <Badge status="processing" color="#aa9bfd" />}
                    <SettingOutlined onClick={() => onSetClick(e)}/>
                  </div>
                </div>
              ))}
            </ul>
            {<p className="font-bold text-indigo-400 text-sm mt-5 mb-2">历史收藏</p>}
            <ul className="ml-2">
              {older.map((e) => (
                <div className={`flex justify-between cursor-pointer px-2 py-2 rounded-2xl 
                  hover:bg-gray-50 active:bg-gray-50 active:text-indigo-400
                  ${selectedId === e.titleId ? 'bg-gray-50 text-indigo-400' : 'text-gray-700'}`}
                >
                  <li className="text-sm" onClick={() => onTitleClick(e.titleId)}>
                    {e.title}
                  </li>
                  <div className="flex items-center gap-2">
                    {!e.hasNew && <Badge status="processing" color="#aa9bfd" />}
                    <SettingOutlined onClick={() => onSetClick(e)}/>
                  </div>
                </div>
              ))}
            </ul>
          </SignedIn>
        }
      </ScrollArea>
      
      {/* 底部 登录/登出 */}
      <div className="flex align-middle mt-5">
        <SignedIn>
          <UserButton />
        </SignedIn>
        <SignedOut>
          <SignInButton>
            {isOpen ? 
            <Button style={{ backgroundColor: "#8A6DF1", color: '#fff' }} type="primary" block>登录</Button> 
            : <Button style={{ backgroundColor: "#8A6DF1", color: '#fff' }} type="primary" icon={<LoginOutlined />}></Button>}
          </SignInButton>
        </SignedOut>
      </div>
      
    </div>
  );
}

export default AppSidebar;
