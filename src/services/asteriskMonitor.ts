export class AsteriskMonitor {
  private ws: WebSocket | null = null;
  private pingInterval: NodeJS.Timeout | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private onStatusChange: (status: { isOnline: boolean; latency: number | null }) => void;

  constructor(
    private asteriskIp: string,
    onStatusChange: (status: { isOnline: boolean; latency: number | null }) => void
  ) {
    this.onStatusChange = onStatusChange;
  }

  public start() {
    this.connect();
  }

  public stop() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  private connect() {
    try {
      this.ws = new WebSocket(`ws://${this.asteriskIp}:8088/ws`);

      this.ws.onopen = () => {
        console.log('Conectado ao Asterisk WebSocket');
        this.onStatusChange({ isOnline: true, latency: 0 });
        this.startPing();
      };

      this.ws.onclose = () => {
        console.log('Desconectado do Asterisk WebSocket');
        this.onStatusChange({ isOnline: false, latency: null });
        this.scheduleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('Erro na conexão WebSocket:', error);
        this.onStatusChange({ isOnline: false, latency: null });
      };

    } catch (error) {
      console.error('Erro ao criar conexão WebSocket:', error);
      this.onStatusChange({ isOnline: false, latency: null });
      this.scheduleReconnect();
    }
  }

  private startPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }

    this.pingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        const startTime = performance.now();
        
        // Envia ping
        this.ws.send(JSON.stringify({ action: 'ping' }));
        
        // Aguarda pong
        this.ws.onmessage = (event) => {
          const endTime = performance.now();
          const latency = Math.round(endTime - startTime);
          
          try {
            const response = JSON.parse(event.data);
            if (response.response === 'pong') {
              this.onStatusChange({ isOnline: true, latency });
            }
          } catch (error) {
            console.error('Erro ao processar resposta do ping:', error);
          }
        };
      }
    }, 5000); // Ping a cada 5 segundos
  }

  private scheduleReconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectTimeout = setTimeout(() => {
      console.log('Tentando reconectar...');
      this.connect();
    }, 5000); // Tenta reconectar após 5 segundos
  }
}
