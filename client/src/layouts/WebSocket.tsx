import { WebSocketContext } from "@/contexts/WebSocketContext";
import { useEffect, useState, type ReactNode } from "react";

interface WebSocketProviderProps {
  children: ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem("apiToken");
    if (!token) {
      console.error("No API token found in localStorage");
      return;
    }
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const environment = import.meta.env.VITE_ENVIRONMENT;
    const ws = new WebSocket(
      `w${environment === "dev" ? "s" : "ss"}://${apiUrl
        .replace("http://", "")
        .replace("https://", "")}/ws?token=${token}`
    );
    ws.onopen = () => {
      setIsConnected(true);
      setSocket(ws);
    };

    ws.onclose = () => {
      setIsConnected(false);
      setSocket(null);
    };
    return () => {
      ws.close();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </WebSocketContext.Provider>
  );
}
