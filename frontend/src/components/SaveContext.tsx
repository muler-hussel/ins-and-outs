import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { Switch, Button } from "antd";
import { useState } from "react";

export default function ControlPanel() {
  const [autoGen, setAutoGen] = useState(false);

  function handleAutoGen() {
    setAutoGen(!autoGen);
  }

  return (
    <Card className="m-2 w-[300px]">
      <CardHeader>
        <CardTitle>保存关键词</CardTitle>
      </CardHeader>
      <CardContent>
        <form>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="keywords">关键词</Label>
              {/* 默认为关键词 */}
              <Input id="keywords" placeholder="请输入事件关键词" />
            </div>
            <div className="flex flex-col space-y-1.5">
              <div className="flex items-center space-x-2">
                <Label htmlFor="autoGen">自动更新</Label>
                <Switch id="autoGen" onChange={handleAutoGen}/>
              </div>
            </div>
            {autoGen && 
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="detailLevel">更新频率（天）</Label>
              <Input id="detailLevel" placeholder="如：1" />
            </div>
            }
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between mt-auto mb-8">
        <Button type="text">取消</Button>
        <Button type="link">保存</Button>
      </CardFooter>
    </Card>
  )
}