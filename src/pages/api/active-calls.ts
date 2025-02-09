import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-api-key'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Validar API key
    const API_KEY = import.meta.env.VITE_ACTIVE_CALLS_API_KEY;
    if (req.headers['x-api-key'] !== API_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const response = await fetch('https://intermed.appinovavoip.com/active-calls?adminpass=35981517Biu', {
      headers: {
        'x-api-key': API_KEY as string
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }

    const data = await response.json();
    
    // Garantir que retornamos um array
    const calls = Array.isArray(data) ? data : [];
    
    res.status(200).json(calls);
  } catch (error) {
    console.error('Error fetching active calls:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
