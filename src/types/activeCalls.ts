const isDownloadDisabled = call.duration < 10;const isDownloadDisabled = call.duration < 10;const isDownloadDisabled = call.duration < 10;const isDownloadDisabled = call.duration < 10;const isDownloadDisabled = call.duration < 10;const isDownloadDisabled = call.duration < 10;const isDownloadDisabled = call.duration < 10;const isDownloadDisabled = call.duration < 10;const isDownloadDisabled = call.duration < 10;const isDownloadDisabled = call.duration < 10;const isDownloadDisabled = call.duration < 10;const isDownloadDisabled = call.duration < 10;const isDownloadDisabled = call.duration < 10;const isDownloadDisabled = call.duration < 10;const isDownloadDisabled = call.duration < 10;const isDownloadDisabled = call.duration < 10;const isDownloadDisabled = call.duration < 10;export interface ActiveCall {
  id: string;
  ramal: string;
  callerid: string;
  destino: string;
  status: string;
  duracao: string;
  channel: string;
}

export interface CallsResponse {
  active_calls: Array<{
    Accountcode: string;
    Application: string;
    CallerID: string;
    Channel: string; // Campo Channel da API
    Duration: string;
    Extension: string;
    State: string;
    BridgeID: string;
    Context: string;
    Data: string;
    PeerAccount: string;
    Prio: string;
  }>;
}
