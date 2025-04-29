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
import { useControlPanel } from "@/provider/ControlPanelProvider";
import { useState, useEffect } from "react";

export default function ControlPanel({ onControlPanelToggle }: { onControlPanelToggle: () => void }) {
  const { defaultValues, closePanel } = useControlPanel();
  const [keyword, setKeyword] = useState("");
  const [timeRange, setTimeRange] = useState("");
  const [detailLevel, setDetailLevel] = useState(500);
  const [focus, setFocus] = useState("");
  const [style, setStyle] = useState("");

  useEffect(() => {
    if (defaultValues) {
      setKeyword(defaultValues.keyword);
      setTimeRange(defaultValues.timeRange);
      setDetailLevel(defaultValues.detailLevel);
      setFocus(defaultValues.focus || "");
      setStyle(defaultValues.style);
    } else {
      resetForm();
    }
  }, [defaultValues]);

  const resetForm = () => {
    setKeyword("");
    setTimeRange("");
    setDetailLevel(500);
    setFocus("");
    setStyle("");
  };

  const handleGenerate = () => {
    if (!keyword || !timeRange || !style || !detailLevel) {
      alert("关键词、时间范围、字数要求和风格选择不能为空！");
      return;
    }

    // 调用生成 API TODO
    console.log({ keyword, timeRange, detailLevel, focus, style });
    closePanel();
  };

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
              <Input id="keyword" placeholder="请输入事件关键词" onChange={(e) => setKeyword(e.target.value)} value={keyword} />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="focus">侧重点（可选）</Label>
              <Input id="focus" placeholder="想突出哪些方面？" onChange={(e) => setFocus(e.target.value)} value={focus} />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="timeRange">时间范围</Label>
              <Input id="timeRange" placeholder="例：最近1个月、过去半年" onChange={(e) => setTimeRange(e.target.value)} value={timeRange} />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="detailLevel">字数要求（详细程度）</Label>
              <Input id="detailLevel" placeholder="如：500" onChange={(e) => setDetailLevel(Number(e.target.value))} value={detailLevel} />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="style">风格选择</Label>
              <Select
                defaultValue="选择生成文风"
                value={style}
                options={[
                  { value: '正式新闻报道', label: '正式新闻报道' },
                  { value: '标题列表摘要', label: '标题列表摘要' },
                  { value: '轻松随笔风格', label: '轻松随笔风格' },
                ]}
                onChange={(e) => setStyle(e)}
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
          hover:bg-indigo-100 hover:text-gray-600"
          onClick={resetForm}>
          <RedoOutlined />
          <p className="text-sm">清空</p>
        </div>
        <div className="flex space-x-2 cursor-pointer px-2 py-2 rounded-2xl 
          hover:bg-indigo-100 hover:text-gray-600"
          onClick={handleGenerate}>
          <CheckOutlined />
          <p className="text-sm">生成</p>
        </div>
      </CardFooter>
    </Card>
  )
}