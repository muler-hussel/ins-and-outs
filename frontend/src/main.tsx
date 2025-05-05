import React from "react"
import { BrowserRouter } from "react-router"
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ClerkProvider } from '@clerk/clerk-react';
import { ApolloProviderWithAuth } from "./apolloClient.tsx"

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
if (!PUBLISHABLE_KEY) {
  throw new Error('Add your Clerk Publishable Key to the .env file')
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <ApolloProviderWithAuth>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ApolloProviderWithAuth>
    </ClerkProvider>
  </React.StrictMode>,
)
