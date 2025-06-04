import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Provider } from "react-redux";
import { appStore } from "./app/store.js";
import { Toaster } from "./components/ui/sonner.jsx";
import { useLoadUserQuery } from "./features/api/userApi";
import LoadingSpinner from "./components/LoadingSpinner";
import { QueryClient, QueryClientProvider,} from '@tanstack/react-query'

const Custom = ({ children }) => {
  const { isLoading } = useLoadUserQuery();
  return <>{isLoading ? <LoadingSpinner/> : <>{children}</>}</>;
};

const queryClient = new QueryClient();


createRoot(document.getElementById("root")).render(
  <StrictMode>
  <QueryClientProvider client={queryClient}>
    <Provider store={appStore}>
      <Custom>
        <App />
        <Toaster />
      </Custom>
    </Provider>
    </QueryClientProvider>
  </StrictMode>
);
