export interface Extension {
  id: string;
  numero: string;
  nome: string;
  status: string;
  callerid: string;
  accountid: string;
}

export interface ActiveCall {
  channel: string;
  ramal: string;
  callerid: string;
  destino: string;
  duracao: string;
  status: 'Chamando' | 'Falando';
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

export interface DTMFCapture {
  id: string;
  created_at: string;
  digit: string;
  channel: string;
  callerid: string;
  origem: string;
}