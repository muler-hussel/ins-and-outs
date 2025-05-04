import { useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { useNewsStore } from '@/store/newsStore';
import { GET_NEWS_BY_TITLE_ID } from '@/graphql/query/GetNewsByTitleId';
import { useParams } from 'react-router';

export function useLoadNewsOfTitle() {
  const { setEntries } = useNewsStore();
  const { titleId } = useParams<{ titleId: string }>();

  const { data, loading, refetch  } = useQuery(GET_NEWS_BY_TITLE_ID, {
    skip: !titleId,
    variables: { titleId: titleId },
  });

  const loadNewsOfTitles = async () => {
    try {
      const { data } = await refetch();
      if (data?.getNewsByTitleId) {
        const sorted = [...data.getNewsByTitleId].sort((a, b) =>
          new Date(a.generateAt).getTime() - new Date(b.generateAt).getTime()
        );
        setEntries(sorted);
      }
    } catch (err) {
      console.error('加载失败:', err);
    }
  };

  useEffect(() => {
    if (data?.getNewsByTitleId) {
      const sorted = [...data.getNewsByTitleId].sort((a, b) =>
        new Date(a.generateAt).getTime() - new Date(b.generateAt).getTime()
      );
      setEntries(sorted);
    }
  }, [data, setEntries]);

  return { loading, loadNewsOfTitles };
}
