import React, { useState } from 'react';
import { Plus, PhoneIncoming, Phone } from 'lucide-react';
import { DIDList } from '../components/DID/DIDList';
import { DIDsDisponiveisModal } from '../components/DID/DIDsDisponiveisModal';
import { useDIDsCliente } from '../hooks/useDIDsCliente';

export const DID = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: dids, isLoading, error } = useDIDsCliente();

  const handleSelectDID = (numero: string) => {
    console.log('Número selecionado:', numero);
    // Aqui você implementa a lógica de ativação do número
    setIsModalOpen(false);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <PhoneIncoming className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Números Entrantes (DID)</h1>
            <p className="text-sm text-gray-600">
              Gerencie seus números de telefone e seus destinos
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700"
        >
          <Plus className="h-5 w-5" />
          Comprar Novo Número
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-[3px] border-indigo-100 border-t-indigo-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Carregando seus números...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Phone className="h-8 w-8 text-red-600" />
          </div>
          <p className="text-red-600 font-medium">Erro ao carregar seus números</p>
          <p className="text-gray-500 mt-2">Por favor, tente novamente mais tarde</p>
        </div>
      ) : !dids?.length ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Phone className="h-8 w-8 text-indigo-600" />
          </div>
          <p className="text-gray-900 font-medium text-lg mb-4">
            Você não possui números ativos conosco!
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg inline-flex items-center gap-2 hover:bg-indigo-700"
          >
            <Plus className="h-5 w-5" />
            Ative agora mesmo
          </button>
        </div>
      ) : (
        <DIDList dids={dids} />
      )}

      <DIDsDisponiveisModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleSelectDID}
      />
    </div>
  );
};