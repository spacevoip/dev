export interface DIDCliente {
  id: string;
  numero: string;
  destino: string;
  status: 'active' | 'inactive';
  valor_mensal: number;
  ultima_chamada: string | null;
  accountid: string;
  simultaneas: number;
}
