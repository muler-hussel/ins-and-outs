import React from "react"
import { BrowserRouter } from "react-router"
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ClerkProvider, useAuth } from '@clerk/clerk-react';
import { ApolloProvider, ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';


const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
if (!PUBLISHABLE_KEY) {
  throw new Error('Add your Clerk Publishable Key to the .env file')
}

function ApolloProviderWithAuth() {
  const { getToken } = useAuth();

  const apolloClient = new ApolloClient({
    link: setContext(async (_, { headers }) => {
      const token = await getToken();
      return {
        headers: {
          ...headers,
          authorization: token ? `Bearer ${token}` : "",
        }
      };
    }).concat(createHttpLink({ 
      uri: 'http://localhost:3000/graphql' 
    })),
    cache: new InMemoryCache(),
  });

  return (
    <ApolloProvider client={apolloClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ApolloProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <ApolloProviderWithAuth />
    </ClerkProvider>
  </React.StrictMode>,
)
