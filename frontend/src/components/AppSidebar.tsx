import { useState, useEffect } from "react";
import { Button, Popover } from "antd";
import { BlockOutlined, SearchOutlined, FormOutlined, LoginOutlined, SettingOutlined, ContainerOutlined } from '@ant-design/icons';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { useModal } from "@/hooks/use-modal";

function AppSidebar({ onControlPanelToggle }: { onControlPanelToggle: () => void }) {
  const [isOpen, setIsOpen] = useState(true);

  // TODO: 这里应该从本地存储或后端加载历史记录
  const mockHistory = [
    { date: "今天", news: [{title:"中美关系"}, {title: "以色列局势"}] },
    { date: "此前", news: [{title: "俄乌战争"}, {title: "AI最新发展"}] },
  ];

  const onSetClick = (keyword: string) => {
    useModal.getState().openModal({
      mode: 'edit',
      initialData: { title: keyword, autoUpdate: false },
      onConfirm: async () => {
        // 调用后端接口
      },
    });
  };

  const toggleSidebar = () => setIsOpen(!isOpen);

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
              <ContainerOutlined className="cursor-pointer px-2 py-2 rounded-xl hover:bg-gray-50" />
            </Popover>
            <Popover content="搜索标题" color="#f7f7f7">
              <SearchOutlined className="cursor-pointer px-2 py-2 rounded-xl hover:bg-gray-50" />
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
        <SignedIn>
          {isOpen && mockHistory.map((section) => (
            <div key={section.date} className="mb-6">
              {<p className="font-bold text-indigo-400 text-sm">{section.date}</p>}
              <ul className="ml-2">
                {section.news
                  .map((keyword, idx) => (
                  <div className="flex justify-between cursor-pointer px-2 py-2 rounded-2xl 
                    hover:bg-gray-50 active:bg-gray-50 active:text-indigo-400">
                    <li key={idx} 
                      className="text-sm text-gray-700 ">
                      {keyword.title}
                    </li>
                    <SettingOutlined onClick={() => onSetClick(keyword.title)}/>
                  </div>
                ))}
              </ul>
            </div>
          ))}
        </SignedIn>
        
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
