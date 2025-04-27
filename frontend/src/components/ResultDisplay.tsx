import {
  Card,
} from "@/components/ui/card";
import { FloatButton } from 'antd';
import { FormOutlined, RedoOutlined, StarOutlined } from '@ant-design/icons';

export default function ControlPanel({ onControlPanelToggle }: { onControlPanelToggle: () => void }) {
  const dummyResponses = [
    "AI生成的第一个回答",
    "AI生成的第二个回答",
  ];
  
  return (
    <Card className="m-2 h-[calc(100vh-16px)] bg-gray-50 justify-end">
      <div className="p-4 space-y-5">
      {dummyResponses.map((response, idx) => (
        <div key={idx}>
          <p className="text-gray-600 text-sm mb-3 bg-white p-4 rounded-xl shadow-sm w-3/4">{response}</p>
          <div className="flex">
            <RedoOutlined 
              className="px-2 py-2 hover:bg-gray-100 rounded-xl"
              onClick={onControlPanelToggle}
            />
            <StarOutlined 
              className="px-2 py-2 hover:bg-gray-100 rounded-xl"
              onClick={onControlPanelToggle}
            />
            
          </div>
        </div>
      ))}

      {/* 右下角悬浮按钮 */}
      <FloatButton
        shape="square"
        style={{ insetInlineEnd: 24 }}
        icon={<FormOutlined />}
        onClick={onControlPanelToggle}
      />
    </div>
    </Card>
  )
}