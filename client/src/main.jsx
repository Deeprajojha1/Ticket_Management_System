import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "./lib/router.jsx";
import { Toaster } from "react-hot-toast";
import App from "./App.jsx";
import { store } from "./app/store.js";
import SocketProvider from "./socket/socketProvider.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <SocketProvider>
          <App />
        </SocketProvider>
        <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);
