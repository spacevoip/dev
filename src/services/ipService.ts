export const getClientIP = async (): Promise<string> => {
  try {
    // Usando ipify que é um serviço gratuito e confiável
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Erro ao obter IP:', error);
    return '';
  }
};
