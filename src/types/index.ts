export interface Extension {
  id: string;
  numero: string;
  nome: string;
  status: string;
  callerid: string;
  accountid: string;
}

export interface ActiveCall {
  id: string;
  from: string;
  to: string;
  duration: number;
  status: 'active' | 'holding' | 'transferring';
  startTime: Date;
}

export interface CallHistory {
  id: string;
  from: string;
  fromName?: string;
  to: string;
  toName?: string;
  duration: number;
  formattedDuration: string;
  status: string;
  start: string;
  timestamp: Date;
  recordingUrl?: string;
}

export interface DIDNumber {
  id: string;
  number: string;
  destination: string;
  status: 'active' | 'inactive';
  monthlyPrice: number;
  lastCall: Date;
}