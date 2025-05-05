import { ApolloClient, ApolloProvider, InMemoryCache, split } from '@apollo/client';
import { createHttpLink } from '@apollo/client/link/http';
import { setContext } from '@apollo/client/link/context';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getOperationName } from '@apollo/client/utilities';
import { useAuth } from '@clerk/clerk-react';

export function ApolloProviderWithAuth({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();

  // WebSocket 链接配置
  const wsLink = new GraphQLWsLink(
    createClient({
      url: 'ws://localhost:3000/graphql',
      connectionParams: async () => ({
        authorization: (await getToken()) ? `Bearer ${await getToken()}` : '',
      }),
    })
  );

  // HTTP 链接配置
  const httpLink = createHttpLink({ 
    uri: 'http://localhost:3000/graphql' 
  });

  // 认证头注入
  const authLink = setContext(async (_, { headers }) => ({
    headers: {
      ...headers,
      authorization: (await getToken()) ? `Bearer ${await getToken()}` : '',
    },
  }));

  // 根据操作类型拆分链接
  const splitLink = split(
    ({ query }) => {
      const operationName = getOperationName(query);
      return operationName === 'Subscription'; // 订阅走 WebSocket
    },
    wsLink,
    authLink.concat(httpLink) // 其他操作走 HTTP
  );

  const apolloClient = new ApolloClient({
    link: splitLink,
    cache: new InMemoryCache(),
  });

  return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>;
}