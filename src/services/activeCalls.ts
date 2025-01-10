import axios from 'axios';

interface ActiveCall {
  Accountcode: string;
  Application: string;
  BridgeID: string;
  CallerID: string;
  Channel: string;
  Context: string;
  Data: string;
  Duration: string;
  Extension: string;
  PeerAccount: string;
  Prio: string;
  State: string;
}

export const fetchActiveCalls = async (): Promise<ActiveCall[]> => {
  try {
    const response = await axios.get(
      'https://intermed.appinovavoip.com:3000/active-calls?adminpass=35981517Biu',
      {
        headers: {
          'x-api-key': '191e8a1e-d313-4e12-b608-d1a759b1a106'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching active calls:', error);
    throw error;
  }
};
