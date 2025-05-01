import {
  Card,
} from "@/components/ui/card";
import { FloatButton } from 'antd';
import { FormOutlined, RedoOutlined, StarOutlined } from '@ant-design/icons';
import { useModal } from "@/hooks/use-modal";

export default function ControlPanel({ onControlPanelToggle }: { onControlPanelToggle: () => void }) {
  const dummyResponses = [
    {content:"AI生成的第一个回答",
      keyword:"第一",
    },
    {content:"AI生成的第二个回答",keyword: "第二",}
  ];

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
    <Card className="m-2 h-[calc(100vh-16px)] bg-gray-50 justify-end">
      <div className="p-4 space-y-5">
      {dummyResponses.map((response, idx) => (
        <div key={idx}>
          <p className="text-gray-600 text-sm mb-3 bg-white p-4 rounded-xl shadow-sm w-3/4">{response.content}</p>
          <div className="flex">
            <RedoOutlined 
              className="px-2 py-2 hover:bg-gray-100 rounded-xl"
              onClick={onControlPanelToggle}
            />
            <StarOutlined 
              className="px-2 py-2 hover:bg-gray-100 rounded-xl"
              onClick={() => onStarClick(response.keyword)}
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