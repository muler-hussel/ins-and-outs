import { useState, useEffect } from "react";
import { Button } from "antd";
import { AntDesignOutlined, SearchOutlined, FormOutlined, LoginOutlined } from '@ant-design/icons';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";

function AppSidebar({ onControlPanelToggle }: { onControlPanelToggle: () => void }) {
  const [isOpen, setIsOpen] = useState(true);

  // TODO: 这里应该从本地存储或后端加载历史记录
  const mockHistory = [
    { date: "今天", keywords: ["中美关系", "以色列局势"] },
    { date: "此前", keywords: ["俄乌战争", "AI最新发展"] },
  ];

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
          <Button onClick={toggleSidebar} type="text" size="large" icon={<AntDesignOutlined />} >
            <div className="text-indigo-500 font-bold">
              来龙去脉
            </div>
          </Button>
          <div className="mt-2 space-x-2">
            <SearchOutlined className="cursor-pointer px-2 py-2 rounded-xl hover:bg-gray-50" />
            <FormOutlined className="cursor-pointer px-2 py-2 rounded-xl hover:bg-gray-50" onClick={onControlPanelToggle}/>
          </div>
        </div>
      }
      {!isOpen && 
        <Button onClick={toggleSidebar} type="text" size="large" icon={<AntDesignOutlined />} >
        </Button>
      }

      <Separator className="mt-3 mb-10"/>

      {/* 历史滚动列表 */}
      <ScrollArea className="flex-1 w-full"> 
        <SignedIn>
          {isOpen && mockHistory.map((section) => (
            <div key={section.date} className="mb-6">
              {<p className="font-bold text-indigo-400 text-sm">{section.date}</p>}
              <ul className="ml-2">
                {section.keywords
                  .map((keyword, idx) => (
                  <li key={idx} 
                  className="text-sm text-gray-700 cursor-pointer px-2 py-2 rounded-2xl 
                    hover:bg-gray-50
                    active:bg-gray-50 active:text-indigo-400">
                    {keyword}
                  </li>
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
