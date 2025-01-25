// Worker para atualização em segundo plano
let intervalId: NodeJS.Timeout | null = null;

// Função que será chamada periodicamente
const startBackgroundUpdate = () => {
  if (intervalId) return; // Evita múltiplos intervalos

  intervalId = setInterval(() => {
    // Envia mensagem para o componente principal
    self.postMessage({ type: 'UPDATE_NEEDED' });
  }, 5000); // 5 segundos
};

// Função para parar a atualização
const stopBackgroundUpdate = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
};

// Listener para mensagens do componente principal
self.addEventListener('message', (event) => {
  switch (event.data.type) {
    case 'START_UPDATES':
      startBackgroundUpdate();
      break;
    case 'STOP_UPDATES':
      stopBackgroundUpdate();
      break;
    default:
      break;
  }
});
