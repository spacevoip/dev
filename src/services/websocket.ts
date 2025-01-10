import { create } from 'zustand';

interface WebSocketStore {
  socket: WebSocket | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  sendMessage: (message: any) => void;
}

const WEBSOCKET_URL = 'wss://intermed.appinovavoip.com:3000/ws';

export const useWebSocket = create<WebSocketStore>((set, get) => ({
  socket: null,
  isConnected: false,
  connect: () => {
    const socket = new WebSocket(WEBSOCKET_URL);

    socket.onopen = () => {
      console.log('WebSocket conectado');
      set({ isConnected: true });
    };

    socket.onclose = () => {
      console.log('WebSocket desconectado');
      set({ isConnected: false });
      // Tentar reconectar após 5 segundos
      setTimeout(() => {
        get().connect();
      }, 5000);
    };

    socket.onerror = (error) => {
      console.error('Erro no WebSocket:', error);
    };

    set({ socket });
  },
  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.close();
      set({ socket: null, isConnected: false });
    }
  },
  sendMessage: (message: any) => {
    const { socket } = get();
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    }
  },
}));
