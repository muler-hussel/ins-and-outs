import { useEffect, useState } from 'react';
import { Modal, Switch, Button, Select } from 'antd';
import { Input } from '@/components/ui/input';

interface StarNewsModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (form: StarNewsFormData) => void;
  onDelete?: () => void;
  mode?: 'new' | 'edit'; // 区分新建 or 编辑
  initialData?: StarNewsFormData;
}

export interface StarNewsFormData {
  title: string;
  autoUpdate: boolean;
  updateFreqAmount?: number;
  updateFreqType?: string;
  relativeAmount: number;
  relativeUnit?: string;
}

export const StarNewsModal = ({
  open,
  onClose,
  onConfirm,
  onDelete,
  initialData,
  mode = 'new',
}: StarNewsModalProps) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [autoUpdate, setAutoUpdate] = useState(initialData?.autoUpdate || false);
  const [freqAmount, setFreqAmount] = useState(initialData?.updateFreqAmount || 1);
  const [freqType, setFreqType] = useState(initialData?.updateFreqType || 'date');
  const [relativeAmount, setRelativeAmount] = useState(initialData?.relativeAmount || 0);
  const [relativeUnit, setRelativeUnit] = useState(initialData?.relativeUnit || "");

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setAutoUpdate(initialData.autoUpdate);
      setFreqAmount(initialData.updateFreqAmount ?? 1);
      setFreqType(initialData.updateFreqType ?? 'date');
      setRelativeAmount(initialData.relativeAmount ?? 0);
      setRelativeUnit(initialData.relativeUnit ?? 'date');
    }
  }, [initialData]);

  return (
    <Modal open={open} onOk={onClose} onCancel={onClose}
      footer={[
        <>
          {mode === 'edit' && <Button onClick={onDelete}>删除</Button>},
          <Button key="cancel" onClick={onClose}>
            取消
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            onClick={() => 
            onConfirm({
              title: title, 
              autoUpdate: autoUpdate, 
              updateFreqAmount: freqAmount, 
              updateFreqType: freqType, 
              relativeAmount: relativeAmount, 
              relativeUnit: relativeUnit
            })}
          >
            确认
          </Button>,
        </>
      ]}
    >
      <h2 className="text-xl font-semibold text-gray-700 mb-4">
        {mode === 'edit' ? '编辑收藏' : '收藏新闻'}
      </h2>

      <div className="mb-8 text-gray-600">
        <label className="text-sm font-medium ">标题</label>
        <Input className="mb-4 mt-2" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      
      <div className="flex items-center gap-4 mb-4 text-gray-600">
        <span className="text-sm">自动更新</span>
        <Switch checked={autoUpdate} onChange={setAutoUpdate} size='small' />
      </div>
      {autoUpdate && (
        <div className='text-gray-600 ml-2'>
          <div className="flex gap-2 items-center">
            <div>更新频率</div>
            <Input
              type="number"
              value={freqAmount}
              onChange={(e) => setFreqAmount(Number(e.target.value))}
              className='w-1/4'
            />
            <Select
              value={freqType}
              options={[
                { value: 'second', label: '秒' },
                { value: 'minute', label: '分' },
                { value: 'hour', label: '小时' },
                { value: 'date', label: '日' },
                { value: 'month', label: '月' },
              ]}
              onChange={(e) => setFreqType(e)}
              className="w-1/2"
            />
          </div>
          <div className="flex gap-2 items-center">
            <div>时间范围</div>
            <Input 
              className="w-1/4"
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
              className="w-1/2"
            />
          </div>
        </div>
      )}
      
    </Modal>
  );
};
