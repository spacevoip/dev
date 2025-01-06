export interface ApiCall {
  Channel: string;
  CallerID: string;
  Duration: string;
  Extension: string;
  State: string;
  Accountcode: string;
}

export interface CallsResponse {
  active_calls: ApiCall[];
}

export interface ActiveCall {
  channel: string;
  callerid: string;
  duracao: string;
  destino: string;
  status: string;
  ramal: string;
}
