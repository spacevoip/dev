import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import { 
  User2, 
  Phone, 
  MapPin, 
  CreditCard,
  Loader2,
  SearchX,
  Calendar,
  Building2,
  MapPinned,
  Building,
  CreditCard as Bank,
  Mail,
  Hash,
  PhoneCall
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ConsultaCampanhaModalProps {
  isOpen: boolean;
  onClose: () => void;
  phoneNumber: string;
}

interface DadosCampanha {
  cpf?: string;
  nome?: string;
  Nome?: string;
  endereco?: string;
  Endereco?: string;
  telefone?: string;
  telefone1?: string;
  fixo?: string;
  Movel?: string;
  Nascimento?: string;
  Cidade?: string;
  Bairro?: string;
  uf?: string;
  cep?: string;
  Banco?: string;
  Agencia?: string;
  Conta?: string;
  sexo?: string;
}

interface HistoricoChamada {
  data_hora: string;
  duracao: string;
  status: string;
  tipo_chamada: string;
}

export function ConsultaCampanhaModal({ isOpen, onClose, phoneNumber }: ConsultaCampanhaModalProps) {
  const [dadosCampanha, setDadosCampanha] = useState<DadosCampanha | null>(null);
  const [historicoChamadas, setHistoricoChamadas] = useState<HistoricoChamada[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingHistorico, setLoadingHistorico] = useState(true);

  const limparValor = (valor: string | undefined): string => {
    if (!valor) return '';
    return valor.replace(/^"+|"+$/g, '');
  };

  useEffect(() => {
    async function buscarDados() {
      if (!phoneNumber) return;
      
      setLoading(true);
      setLoadingHistorico(true);
      
      try {
        const numeroLimpo = phoneNumber.replace(/^55/, '');
        console.log('Buscando número:', numeroLimpo);
        
        // Busca dados do cliente
        const { data: dadosCliente, error: errorCliente } = await supabase
          .rpc('buscar_por_numero', {
            numero_busca: numeroLimpo
          });

        if (errorCliente) {
          console.error('Erro na busca de dados:', errorCliente);
          setDadosCampanha(null);
        } else if (dadosCliente && dadosCliente.length > 0) {
          const dados = dadosCliente[0].dados || dadosCliente[0];
          const dadosLimpos = Object.entries(dados).reduce((acc, [key, value]) => {
            const chaveCorrigida = limparValor(key);
            if (typeof value === 'string') {
              acc[chaveCorrigida] = limparValor(value);
            } else if (value !== null && value !== undefined) {
              acc[chaveCorrigida] = String(value);
            }
            return acc;
          }, {} as DadosCampanha);
          
          setDadosCampanha(dadosLimpos);
        } else {
          setDadosCampanha(null);
        }

        // Busca histórico de chamadas
        const { data: historicoData, error: historicoError } = await supabase
          .rpc('buscar_historico_chamadas', {
            numero_busca: numeroLimpo
          });

        if (historicoError) {
          console.error('Erro na busca do histórico:', historicoError);
          setHistoricoChamadas([]);
        } else {
          setHistoricoChamadas(historicoData || []);
        }
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        setDadosCampanha(null);
        setHistoricoChamadas([]);
      } finally {
        setLoading(false);
        setLoadingHistorico(false);
      }
    }

    if (isOpen) {
      buscarDados();
    }
  }, [isOpen, phoneNumber]);

  const formatarTelefone = (telefone: string): string => {
    const numero = telefone.replace(/\D/g, '');
    if (numero.length === 11) {
      return `(${numero.slice(0, 2)}) ${numero.slice(2, 7)}-${numero.slice(7)}`;
    }
    if (numero.length === 10) {
      return `(${numero.slice(0, 2)}) ${numero.slice(2, 6)}-${numero.slice(6)}`;
    }
    return telefone;
  };

  const formatarCPF = (cpf: string): string => {
    const numero = cpf.replace(/\D/g, '');
    if (numero.length === 11) {
      return `${numero.slice(0, 3)}.${numero.slice(3, 6)}.${numero.slice(6, 9)}-${numero.slice(9)}`;
    }
    return cpf;
  };

  const formatarData = (data: string): string => {
    if (!data) return '';
    const partes = data.split('/');
    if (partes.length === 3) {
      const [dia, mes, ano] = partes;
      return `${dia.padStart(2, '0')}/${mes.padStart(2, '0')}/${ano}`;
    }
    return data;
  };

  const getBancoNome = (codigo: string): string => {
    const bancos: { [key: string]: string } = {
      '001': 'Banco do Brasil',
      '237': 'Bradesco',
      '341': 'Itaú',
      '033': 'Santander',
      '104': 'Caixa Econômica',
    };
    return bancos[codigo] || `Banco ${codigo}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <User2 className="h-6 w-6 text-primary" />
            Dados do Cliente
          </DialogTitle>
          <DialogDescription asChild>
            <div className="flex items-center gap-2 text-base">
              <Phone className="h-4 w-4" />
              <span>Informações associadas ao número</span>
              <Badge variant="secondary" className="text-base font-medium">
                {formatarTelefone(phoneNumber.replace(/^55/, ''))}
              </Badge>
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-8 space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Buscando informações...</p>
            </div>
          ) : dadosCampanha && Object.keys(dadosCampanha).length > 0 ? (
            <div className="space-y-6">
              <div className="bg-white rounded-lg border shadow-sm">
                <div className="p-6">
                  <div className="flex items-start space-x-4 mb-6 bg-primary/5 p-4 rounded-lg">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <User2 className="h-8 w-8 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xl font-semibold text-primary truncate">
                        {dadosCampanha.Nome || 'Nome não informado'}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {dadosCampanha.sexo && (
                          <Badge variant="outline" className="text-xs">
                            Sexo: {dadosCampanha.sexo}
                          </Badge>
                        )}
                        {dadosCampanha.cpf && (
                          <Badge variant="outline" className="text-xs">
                            CPF: {formatarCPF(dadosCampanha.cpf)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid gap-6">
                    {dadosCampanha.Nascimento && (
                      <div className="flex items-start space-x-4">
                        <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Data de Nascimento</p>
                          <p className="mt-1 font-medium">{formatarData(dadosCampanha.Nascimento)}</p>
                        </div>
                      </div>
                    )}
                    
                    {dadosCampanha.Endereco && (
                      <div className="space-y-4">
                        <div className="flex items-start space-x-4">
                          <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-500">Endereço</p>
                            <p className="mt-1">{dadosCampanha.Endereco}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 ml-9">
                          {dadosCampanha.Bairro && (
                            <div>
                              <p className="text-sm font-medium text-gray-500">Bairro</p>
                              <p className="mt-1">{dadosCampanha.Bairro}</p>
                            </div>
                          )}
                          {dadosCampanha.Cidade && (
                            <div>
                              <p className="text-sm font-medium text-gray-500">Cidade</p>
                              <p className="mt-1">{dadosCampanha.Cidade}</p>
                            </div>
                          )}
                          {dadosCampanha.uf && (
                            <div>
                              <p className="text-sm font-medium text-gray-500">UF</p>
                              <Badge variant="outline">{dadosCampanha.uf}</Badge>
                            </div>
                          )}
                        </div>

                        {dadosCampanha.cep && (
                          <div className="ml-9">
                            <p className="text-sm font-medium text-gray-500">CEP</p>
                            <p className="mt-1">{dadosCampanha.cep}</p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="grid gap-4">
                      {dadosCampanha.Movel && (
                        <div className="flex items-start space-x-4">
                          <Phone className="h-5 w-5 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-500">Celular</p>
                            <p className="mt-1 font-medium">
                              {formatarTelefone(dadosCampanha.Movel)}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {dadosCampanha.fixo && (
                        <div className="flex items-start space-x-4 ml-9">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Telefone Fixo</p>
                            <p className="mt-1 font-medium">
                              {formatarTelefone(dadosCampanha.fixo)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {(dadosCampanha.Banco || dadosCampanha.Agencia || dadosCampanha.Conta) && (
                      <div className="border-t pt-4 mt-4">
                        <div className="flex items-center space-x-4 mb-4">
                          <Bank className="h-5 w-5 text-gray-500" />
                          <p className="text-sm font-medium text-gray-500">Dados Bancários</p>
                        </div>
                        <div className="grid gap-4 ml-9">
                          {dadosCampanha.Banco && (
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-sm">
                                {getBancoNome(dadosCampanha.Banco)}
                              </Badge>
                            </div>
                          )}
                          <div className="grid grid-cols-2 gap-4">
                            {dadosCampanha.Agencia && (
                              <div>
                                <p className="text-sm font-medium text-gray-500">Agência</p>
                                <p className="mt-1">{dadosCampanha.Agencia}</p>
                              </div>
                            )}
                            {dadosCampanha.Conta && (
                              <div>
                                <p className="text-sm font-medium text-gray-500">Conta</p>
                                <p className="mt-1">{dadosCampanha.Conta}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Histórico de Chamadas */}
                    <div className="border-t pt-4 mt-4">
                      <div className="flex items-center space-x-4 mb-4">
                        <PhoneCall className="h-5 w-5 text-gray-500" />
                        <p className="text-sm font-medium text-gray-500">Histórico de Chamadas</p>
                      </div>
                      
                      {loadingHistorico ? (
                        <div className="flex items-center justify-center p-4">
                          <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        </div>
                      ) : historicoChamadas.length > 0 ? (
                        <div className="space-y-3 ml-9">
                          {historicoChamadas.map((chamada, index) => (
                            <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">
                                  {format(new Date(chamada.data_hora), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {chamada.tipo_chamada}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant={chamada.status === 'Atendida' ? 'success' : 
                                          chamada.status === 'Não Atendida' ? 'destructive' : 
                                          'secondary'}
                                  className="text-xs"
                                >
                                  {chamada.status}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  {chamada.duracao}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 ml-9">
                          Nenhum histórico de chamadas encontrado.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 space-y-4">
              <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                <SearchX className="h-6 w-6 text-gray-400" />
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  Nenhum dado encontrado para este número.
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
