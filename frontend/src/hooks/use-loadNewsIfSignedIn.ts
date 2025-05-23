import { useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { useNewsStore } from '@/store/newsStore';
import { useAuth } from '@clerk/clerk-react';
import { GET_ALL_NEWS } from '@/graphql/query/GetAllNews';
import { useParams } from 'react-router';

export function useLoadNewsIfSignedIn() {
  const { isSignedIn, isLoaded } = useAuth();
  const { setEntries } = useNewsStore();
  const { titleId } = useParams<{ titleId: string }>();

  const { data, loading, refetch } = useQuery(GET_ALL_NEWS, {
    skip: !!titleId || !isSignedIn || !isLoaded, // 不登录就不发请求，选中标题时不加载
  });

  const loadNews = async () => {
    try {
      const { data } = await refetch();
      if (data?.getAllNews) {
        const sorted = [...data.getAllNews].sort((a, b) =>
          new Date(a.generateAt).getTime() - new Date(b.generateAt).getTime()
        );
        setEntries(sorted);
      }
    } catch (err) {
      console.error('加载失败:', err);
    }
  };

  useEffect(() => {
    if (data?.getAllNews) {
      const sorted = [...data.getAllNews].sort((a, b) =>
        new Date(a.generateAt).getTime() - new Date(b.generateAt).getTime()
      );
      setEntries(sorted);
    }
  }, [data, setEntries]);

  return { loading, loadNews };
}
