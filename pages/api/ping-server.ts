import { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { host } = req.query;

  if (!host || typeof host !== 'string') {
    return res.status(400).json({ error: 'Host parameter is required' });
  }

  try {
    // Windows ping command
    const command = `ping -n 1 -w 1000 ${host}`;
    const { stdout } = await execAsync(command);

    // Verifica se recebeu resposta
    const isOnline = !stdout.includes('Host de destino inacessível') && 
                    !stdout.includes('Esgotado o tempo limite do pedido') &&
                    !stdout.includes('Request timed out');

    // Extrai o tempo se estiver online
    let time = null;
    if (isOnline) {
      const match = stdout.match(/tempo[=<](\d+)ms/);
      if (match) {
        time = parseInt(match[1]);
      }
    }

    return res.status(200).json({
      online: isOnline,
      time,
      output: stdout
    });
  } catch (error) {
    console.error('Erro ao executar ping:', error);
    return res.status(200).json({
      online: false,
      time: null,
      error: 'Failed to ping host'
    });
  }
}
