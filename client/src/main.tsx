import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Provider } from "./components/ui/provider.tsx";
import { AppRoutes } from "./routes.tsx";
import Notifications from "./components/Notifications.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider>
      <AppRoutes />
      <Notifications />
    </Provider>
  </StrictMode>
);
