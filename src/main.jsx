import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import GlobalStyles from "./components/GlobalStyles/index.jsx";
import ScrollToTop from "~/components/ScrollToTop";
import store from "~/store";
import { Provider } from "react-redux";
import App from "~/App.jsx";
import { ToastProvider } from "~/contexts/ToastContext.jsx";

createRoot(document.getElementById("root")).render(
  // <StrictMode>
  <Provider store={store}>
    <GlobalStyles>
      <BrowserRouter>
        <ScrollToTop />
        <ToastProvider>  
          <App />
        </ToastProvider>
      </BrowserRouter>
    </GlobalStyles>
  </Provider>
  // </StrictMode>
);
