import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { host } = req.query;

  if (!host || typeof host !== 'string') {
    return res.status(400).json({ error: 'Host parameter is required' });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 segundos timeout

    const startTime = Date.now();
    const response = await fetch(`http://${host}`, {
      method: 'HEAD',
      signal: controller.signal
    });
    const endTime = Date.now();
    
    clearTimeout(timeoutId);

    res.status(200).json({
      online: response.ok,
      time: endTime - startTime
    });
  } catch (error) {
    console.error('Erro ao verificar host:', error);
    res.status(200).json({ 
      online: false,
      time: null
    });
  }
}
