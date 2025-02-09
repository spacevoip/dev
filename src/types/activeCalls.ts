export interface ApiCall {
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

export interface ActiveCall {
  channel: string;
  callerid: string;
  duracao: string;
  destino: string;
  status: string;
  ramal: string;
}
