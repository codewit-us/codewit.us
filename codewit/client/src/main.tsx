import './styles.css';
import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from "react-toastify";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import "react-toastify/dist/ReactToastify.css";

import App from './app/app';

const query_client = new QueryClient();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  // <StrictMode>
  <QueryClientProvider client={query_client}>
    <BrowserRouter>
      <App />
      <ToastContainer position="bottom-right" autoClose={1000} />
    </BrowserRouter>
    <ReactQueryDevtools initialIsOpen={false}/>
  </QueryClientProvider>
  // </StrictMode>
);
