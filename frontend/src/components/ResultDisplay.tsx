import { FloatButton, Popover } from 'antd';
import { FormOutlined, RedoOutlined, StarOutlined, StarFilled } from '@ant-design/icons';
import { useModal } from "@/hooks/use-modal";
import { useNewsStore } from '../store/newsStore';
import { ScrollArea } from "./ui/scroll-area";
import { SignedIn } from '@clerk/clerk-react';

export default function ControlPanel({ onControlPanelToggle }: { onControlPanelToggle: () => void }) {
  const entries = useNewsStore((s) => s.entries);

  const onStarClick = (keyword: string) => {
    useModal.getState().openModal({
      mode: 'new',
      initialData: { title: keyword, autoUpdate: false },
      onConfirm: async () => {
        // 调用后端接口
      },
    });
  };

  return (
    <ScrollArea className="m-2 h-[calc(100vh-16px)] bg-gray-50 justify-end rounded-xl">
      <div className="p-4 space-y-5 w-3/4">
        {entries.map((entry) => (
          <div key={entry._id}>
            <div 
              className="text-gray-600 text-sm mb-3 bg-white p-4 rounded-xl shadow-sm whitespace-pre-wrap"
            >
              {entry.content}
            </div>
            <div className="flex">
              <Popover content="重新生成" color="#f7f7f7">
                <RedoOutlined 
                  className="px-2 py-2 hover:bg-gray-100 rounded-xl"
                  onClick={onControlPanelToggle}
                />
              </Popover>
              <SignedIn>
                <Popover content="收藏" color="#f7f7f7">
                  <StarOutlined 
                    className="px-2 py-2 hover:bg-gray-100 rounded-xl"
                    // onClick={}
                  />
                </Popover>
                <Popover content="取消收藏" color="#f7f7f7">
                  <StarFilled className="px-2 py-2 hover:bg-gray-100 rounded-xl" style={{color: "#ffe881"}} /> 
                </Popover>
              </SignedIn>
              <div className="text-xs text-gray-400 ml-auto">{new Date(entry.generateAt).toLocaleString()}</div>
            </div>
          </div>
        ))}

        {/* 右下角悬浮按钮 */}
        <Popover content="创建新生成" color="#f7f7f7">
          <FloatButton
            shape="square"
            style={{ insetInlineEnd: 24 }}
            icon={<FormOutlined />}
            onClick={onControlPanelToggle}
          />
        </Popover>
      </div>
    </ScrollArea>
  )
}