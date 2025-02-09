export interface DIDDisponivel {
  created_at: string;
  numero: string;
  simultaneas: number;
  valor: number;
}

export interface DIDsDisponiveisResponse {
  data: DIDDisponivel[];
  error: any;
}
