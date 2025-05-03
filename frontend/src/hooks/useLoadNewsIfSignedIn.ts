import { useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { useNewsStore } from '@/store/newsStore';
import { useAuth } from '@clerk/clerk-react';
import { GET_ALL_NEWS } from '@/graphql/query/GetAllNews';

export function useLoadNewsIfSignedIn() {
  const { isSignedIn, isLoaded } = useAuth();
  const { setEntries } = useNewsStore();

  const { data, error, loading  } = useQuery(GET_ALL_NEWS, {
    skip: !isSignedIn || !isLoaded, // 不登录就不发请求
  });

  useEffect(() => {
    if (error) {
      console.error('加载新闻失败:', error);
    }
  }, [error]);

  useEffect(() => {
    if (data?.getAllNews) {
      const sorted = [...data.getAllNews].sort((a, b) =>
        new Date(a.generateAt).getTime() - new Date(b.generateAt).getTime()
      );
      setEntries(sorted);
    }
  }, [data, setEntries]);

  return { loading };
}
