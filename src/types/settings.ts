export interface UserProfileProps {
  userData: {
    name: string;
    email: string;
    plano?: string;
    created_at: string;
    accountid: string;
    status: string;
    contato?: string;
    documento?: string;
  };
  planData?: {
    id: string;
    nome: string;
    description: string;
    valor: number;
    validade: number;
    limite: number;
  };
}
