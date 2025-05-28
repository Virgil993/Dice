import { createContext, useContext } from "react";

export interface WebSocketContextType {
  socket: WebSocket | null;
  isConnected: boolean;
}

const defaultWebSocketContext: WebSocketContextType = {
  socket: null,
  isConnected: false,
};

export const WebSocketContext = createContext(defaultWebSocketContext);

export const useWebSocket = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};
