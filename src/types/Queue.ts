export interface Queue {
  id: string;
  accountid: string;
  nome: string;
  estrategia: string;
  ramais: string;
  status: 'Ativo' | 'Inativo';
  created_at: string;
}
