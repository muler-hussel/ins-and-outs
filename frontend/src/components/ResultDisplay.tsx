import { FloatButton, Popover } from 'antd';
import { FormOutlined, RedoOutlined, StarOutlined, StarFilled } from '@ant-design/icons';
import { StarNewsFormData, useModal } from "@/hooks/use-modal";
import { useNewsStore } from '../store/newsStore';
import { ScrollArea } from "./ui/scroll-area";
import { SignedIn, useUser } from '@clerk/clerk-react';
import axios from 'axios';
import { useControlPanel } from '@/provider/ControlPanelProvider';
import { Dayjs } from 'dayjs';
import { useMutation } from '@apollo/client';
import { STAR_NEWS } from '@/graphql/mutation/StarNews';
import { UN_STAR_NEWS } from '@/graphql/mutation/UnStarNews';
import { useLoadTitlesIfSignedIn } from '@/hooks/use-loadTitlesIfSignedIn';
import { useLoadNewsOfTitle } from '@/hooks/use-loadNewsOfTitle';
import { useParams } from 'react-router';
import { useLoadNewsIfSignedIn } from '@/hooks/use-loadNewsIfSignedIn';

export default function ResultDisplay({ onControlPanelToggle }: { onControlPanelToggle: () => void }) {
  const { titleId } = useParams<{ titleId: string }>();
  const { updateStarredState, entries } = useNewsStore();
  const { isSignedIn } = useUser();
  const { openPanel } = useControlPanel();
  const [starNews] = useMutation(STAR_NEWS);
  const [unstarNews] = useMutation(UN_STAR_NEWS);
  const { loadTitles } = useLoadTitlesIfSignedIn(); 
  const { loadNewsOfTitles } = useLoadNewsOfTitle();
  const { loadNews } = useLoadNewsIfSignedIn();
  const { loading } = titleId ? loadNewsOfTitles() : loadNews();

  const handleRegenerate = async (newsId?: string, generateAt?: string) => {
    if (isSignedIn && newsId) {
      try {
        const res = await axios.get(`/api/news/${newsId}/params`);
        openPanel(res.data); 
      } catch (error) {
        console.error("获取参数失败：", error);
        alert("无法获取历史参数，请重试或联系管理员。");
      }
    } else {
      for (const entry of entries) {
        if (entry.generateAt === generateAt) {
          openPanel({
            ...entry,
            absoluteStart: entry.absoluteStart ? new Dayjs(entry.absoluteStart) : null,
            absoluteEnd: entry.absoluteEnd ? new Dayjs(entry.absoluteEnd) : null,
          })
        } else {
          alert("无法重新生成，缺少参数。请重新填写。");
        }
      }
    }
  }

  const onStarClick = async (newsId: string) => {
    if (!newsId) {
      alert("请登录。");
    }
    try {
      const res = await axios.get(`/api/news/${newsId}/params`);
      useModal.getState().openModal({
        mode: 'new',
        initialData: { title: res.data.keyword, autoUpdate: false },
        onConfirm: async (formData: StarNewsFormData) => {
          try {
            await starNews({
              variables: {
                starNewsDto: {
                  ...formData,
                  newsId: newsId,
                  content: res.data.content,
                }
              }
            });
            updateStarredState(newsId, true);
            loadTitles();
          } catch (error) {
            alert(error);
          }
        }
    })}catch (error) {
      console.error("获取参数失败：", error);
      alert("无法获取历史参数，请重试或联系管理员。");
    };
  }

  const unStar = async (newsId: string) => {
    if (!newsId) {
      alert("请登录。");
    }
    try {
      await unstarNews({
        variables: {newsId: newsId}
      });
      updateStarredState(newsId, false);
      loadTitles();
    } catch (err) {
      alert(err);
    }
  }

  return (
    <ScrollArea className="m-2 h-[calc(100vh-16px)] bg-gray-50 justify-end rounded-xl">
      <div className="p-4 space-y-5 w-3/4">
        {entries.map((entry) => (
          <div key={entry.generateAt}>
            <div 
              className="text-gray-600 text-sm mb-3 bg-white p-4 rounded-xl shadow-sm whitespace-pre-wrap"
            >
              {entry.content}
            </div>
            <div className="flex">
              <Popover content="重新生成" color="#f7f7f7">
                <RedoOutlined 
                  className="px-2 py-2 hover:bg-gray-100 rounded-xl"
                  onClick={() => handleRegenerate(entry._id, entry.generateAt)}
                />
              </Popover>
              <SignedIn>
                {entry.starred ? (
                  <Popover content="取消收藏" color="#f7f7f7">
                    <StarFilled className="px-2 py-2 hover:bg-gray-100 rounded-xl" style={{color: "#ffe881"}} 
                      onClick={() => unStar(entry._id as string)}
                    /> 
                  </Popover>
                ) : (
                  <Popover content="收藏" color="#f7f7f7">
                    <StarOutlined 
                      className="px-2 py-2 hover:bg-gray-100 rounded-xl"
                      onClick={() => onStarClick(entry._id as string)}
                    />
                  </Popover>
                )}
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
