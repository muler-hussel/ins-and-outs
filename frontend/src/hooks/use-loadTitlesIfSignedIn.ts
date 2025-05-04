import { useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { useAuth } from '@clerk/clerk-react';
import { GET_ALL_TITLES } from '@/graphql/query/GetAllTitles';
import { useStarredStore } from '@/store/starredStore';

export function useLoadTitlesIfSignedIn() {
  const { isSignedIn, isLoaded } = useAuth();
  const { setStarredTitles } = useStarredStore();

  const { data, refetch, loading } = useQuery(GET_ALL_TITLES, {
    skip: !isSignedIn || !isLoaded, // 不登录就不发请求
  });

  const loadTitles = async () => {
    try {
      const { data } = await refetch();
      if (data?.getAllTitles) setStarredTitles(data.getAllTitles);
    } catch (err) {
      console.error('加载失败:', err);
    }
  };

  useEffect(() => {
    if (data?.getAllTitles) {
      setStarredTitles(data.getAllTitles);
    }
  }, [data, setStarredTitles]);

  return { loadTitles, loading };
}
