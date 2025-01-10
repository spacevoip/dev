import React from 'react';
import { User, Phone, FileText, Calendar } from 'lucide-react';
import { UserProfileProps } from '../../types/settings';

export function ProfileCard({ userData }: UserProfileProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gray-50 rounded-lg">
            <User className="h-5 w-5 text-gray-400" />
          </div>
          <div>
            <h2 className="text-base font-medium text-gray-900">Informações Pessoais</h2>
            <p className="text-sm text-gray-500">
              Gerencie suas informações pessoais e de contato
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start space-x-3">
            <User className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-500">Nome</p>
              <p className="mt-1 text-sm text-gray-900">{userData.name}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <svg className="h-5 w-5 text-gray-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="mt-1 text-sm text-gray-900">{userData.email}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-500">Telefone / WhatsApp</p>
              <p className="mt-1 text-sm text-gray-900">{userData.contato || '-'}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-500">CPF/CNPJ</p>
              <p className="mt-1 text-sm text-gray-900">{userData.documento || '-'}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-500">Cliente Desde</p>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(userData.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Editar Informações
        </button>
      </div>
    </div>
  );
}
