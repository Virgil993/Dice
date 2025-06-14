import { Outlet } from "react-router-dom";
import Admin from "./layouts/Admin";
import { WebSocketProvider } from "./layouts/WebSocket";

function App() {
  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <Admin
        element={
          <WebSocketProvider>
            <Outlet />
          </WebSocketProvider>
        }
      />
    </div>
  );
}

export default App;
