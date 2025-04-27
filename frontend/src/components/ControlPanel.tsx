import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Label } from "./ui/label"
import { Select, Input } from "antd";
import { ArrowLeftOutlined, RedoOutlined, CheckOutlined } from "@ant-design/icons"

export default function ControlPanel({ onControlPanelToggle }: { onControlPanelToggle: () => void }) {
  return (
    <Card className="m-2 w-[300px] bg-gray-50 text-gray-700">
      <CardHeader>
        <CardTitle>新闻生成器</CardTitle>
      </CardHeader>
      <CardContent>
        <form>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="keywords">关键词</Label>
              <Input id="keywords" placeholder="请输入事件关键词" />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="focus">侧重点（可选）</Label>
              <Input id="focus" placeholder="想突出哪些方面？" />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="timeRange">时间范围</Label>
              <Input id="timeRange" placeholder="例：最近1个月、过去半年" />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="detailLevel">字数要求（详细程度）</Label>
              <Input id="detailLevel" placeholder="如：500" />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="style">风格选择</Label>
              <Select
                defaultValue="选择生成文风"
                options={[
                  { value: 'formal', label: '正式新闻报道' },
                  { value: 'abstract', label: '标题列表摘要' },
                  { value: 'easy', label: '轻松随笔风格' },
                ]}
              />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between mt-auto mb-8">
        <div className="flex space-x-2 cursor-pointer px-2 py-2 rounded-2xl 
          hover:bg-indigo-100 hover:text-gray-600"
          onClick={onControlPanelToggle}
        >
          <ArrowLeftOutlined />
          <p className="text-sm">取消</p>
        </div>
        <div className="flex space-x-2 cursor-pointer px-2 py-2 rounded-2xl 
          hover:bg-indigo-100 hover:text-gray-600">
          <RedoOutlined />
          <p className="text-sm">清空</p>
        </div>
        <div className="flex space-x-2 cursor-pointer px-2 py-2 rounded-2xl 
          hover:bg-indigo-100 hover:text-gray-600">
          <CheckOutlined />
          <p className="text-sm">生成</p>
        </div>
      </CardFooter>
    </Card>
  )
}