import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import App from './app/app';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  // <StrictMode>
    <BrowserRouter>
      <App />
      <ToastContainer position="bottom-right" autoClose={3000} />
    </BrowserRouter>
  // </StrictMode>
);
