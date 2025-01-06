export interface CDRRecord {
  id: number;
  accountid: string;
  start: string;
  answer?: string;
  end?: string;
  billsec?: number;
  disposition: string;
  channel: string;
  dst: string;
  recording_url?: string;
}
