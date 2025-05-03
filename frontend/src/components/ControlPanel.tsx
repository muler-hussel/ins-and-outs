import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Label } from "./ui/label"
import { Select, Input, Radio, DatePicker } from "antd";
import { ArrowLeftOutlined, DeleteOutlined, CheckOutlined } from "@ant-design/icons"
import { useControlPanel } from "@/provider/ControlPanelProvider";
import { useState, useEffect } from "react";
import dayjs, { Dayjs } from 'dayjs';
import axios from 'axios';
import { useNewsStore } from "@/store/newsStore";

export default function ControlPanel({ onControlPanelToggle }: { onControlPanelToggle: () => void }) {
  const { defaultValues, closePanel } = useControlPanel();
  const [keyword, setKeyword] = useState("");
  const [relativeAmount, setRelativeAmount] = useState(0);
  const [relativeUnit, setRelativeUnit] = useState("");
  const [absoluteStart, setAbsoluteStart] = useState<Dayjs | null>(null);
  const [absoluteEnd, setAbsoluteEnd] = useState<Dayjs | null>(null);
  const [detailLevel, setDetailLevel] = useState(500);
  const [focus, setFocus] = useState("");
  const [style, setStyle] = useState("");
  const [timeMode, setTimeMode] = useState<'relative' | 'absolute'>('relative');
  const [startPicker, setStartPicker] = useState<PickerType>('date');
  const [endPicker, setEndPicker] = useState<PickerType>('date');

  const addEntry = useNewsStore((s) => s.addEntry);

  useEffect(() => {
    if (defaultValues) {
      setKeyword(defaultValues.keyword);
      setRelativeAmount(defaultValues.relativeAmount || 0);
      setRelativeUnit(defaultValues.relativeUnit || "");
      setAbsoluteStart(defaultValues.absoluteStart);
      setAbsoluteEnd(defaultValues.absoluteEnd);
      setDetailLevel(defaultValues.detailLevel || 500);
      setFocus(defaultValues.focus || "");
      setStyle(defaultValues.style);
      setTimeMode('relative');
      setStartPicker('date');
      setEndPicker('date')
    } else {
      resetForm();
    }
  }, [defaultValues]);

  const resetForm = () => {
    setKeyword("");
    setRelativeAmount(0);
    setRelativeUnit("");
    setAbsoluteStart(null);
    setAbsoluteEnd(null);
    setDetailLevel(500);
    setFocus("");
    setStyle("");
    setTimeMode('relative');
    setStartPicker('date');
    setEndPicker('date')
  };

  const handleGenerate = async () => {
    if (!keyword || !style || !detailLevel) {
      alert("关键词、字数要求和风格选择不能为空！");
      return;
    }

    if (timeMode === "relative" && !relativeUnit) {
      alert("时间范围不能为空！");
      return;
    } else if (timeMode === 'absolute' && (absoluteStart === null || absoluteEnd === null)) {
      alert("时间范围不能为空！");
      return;
    }

    const payload = {
      keyword,
      style,
      detailLevel,
      focus,
      timeMode,
      relativeAmount,
      relativeUnit,
      absoluteStart,
      absoluteEnd,
      startPicker,
      endPicker,
    };
    try {
      const result = await axios.post('api/news/', payload);
      console.log(result.data);
      addEntry(result.data);
      closePanel();
    } catch (err) {
      console.error(err);
    }
  };

  const { Option } = Select;
  type PickerType = 'date' | 'month' | 'year';

  return (
    <Card className="m-2 w-[300px] bg-gray-50 text-gray-700">
      <CardHeader>
        <CardTitle>新闻生成器</CardTitle>
      </CardHeader>
      <CardContent>
        <form>
          <div className="grid w-full items-center gap-4 gap-y-8">
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
              <Radio.Group
                defaultValue={'relative'}
                options={[ { value: 'relative', label: "相对时间" }, { value: 'absolute', label: "绝对时间" } ]}
                value={timeMode}
                onChange={(e) => setTimeMode(e.target.value)}
              ></Radio.Group>
              {timeMode === "relative" ? (
                <div className="grid grid-cols-3 gap-2">
                  <Input 
                    className="col-span-1"
                    type="number" 
                    value={relativeAmount} 
                    onChange={(e) => setRelativeAmount(Number(e.target.value))} 
                  />
                  <Select
                    value={relativeUnit}
                    options={[
                      { value: 'second', label: '秒' },
                      { value: 'minute', label: '分' },
                      { value: 'hour', label: '小时' },
                      { value: 'date', label: '日' },
                      { value: 'month', label: '月' },
                      { value: 'year', label: '年' },
                    ]}
                    onChange={(e) => setRelativeUnit(e)}
                    className="col-span-2"
                  />
                </div>
              ) : (
                <div className="text-sm mt-1">
                  <label>开始：</label>
                  <Select aria-label="Picker Type" value={startPicker} onChange={setStartPicker} >
                    <Option value="date">日</Option>
                    <Option value="month">月</Option>
                    <Option value="year">年</Option>
                  </Select>
                  <DatePicker 
                    value={absoluteStart ? dayjs(absoluteStart) : null} 
                    onChange={(date) => setAbsoluteStart(date)} 
                    picker={startPicker} placeholder="请选择时间" 
                  />
                  <label>结束：</label>
                  <Select aria-label="Picker Type" value={endPicker} onChange={setEndPicker} >
                    <Option value="date">日</Option>
                    <Option value="month">月</Option>
                    <Option value="year">年</Option>
                  </Select>
                  <DatePicker 
                    value={absoluteEnd ? dayjs(absoluteEnd) : null} 
                    onChange={(date) => setAbsoluteEnd(date)} 
                    picker={endPicker} placeholder="请选择时间" 
                  />
                </div>
              )}
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
          <DeleteOutlined />
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