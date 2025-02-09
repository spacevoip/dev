import React, { useState } from 'react';
import { Shield, Eye, EyeOff, KeyRound } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'A senha atual é obrigatória'),
  newPassword: z.string()
    .min(8, 'A senha deve ter no mínimo 8 caracteres')
    .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'A senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'A senha deve conter pelo menos um número'),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

export function SecurityCard() {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { updatePassword } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema)
  });

  const onSubmit = async (data: ChangePasswordForm) => {
    try {
      await updatePassword(data.currentPassword, data.newPassword);
      toast.success('Senha alterada com sucesso!');
      reset();
      setShowPasswordForm(false);
    } catch (error) {
      toast.error('Erro ao alterar senha. Verifique sua senha atual.');
    }
  };

  const PasswordInput = ({ 
    id, 
    label, 
    show, 
    setShow, 
    error, 
    ...rest 
  }: { 
    id: "currentPassword" | "newPassword" | "confirmPassword";
    label: string;
    show: boolean;
    setShow: (show: boolean) => void;
    error?: string;
  }) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-500">
        {label}
      </label>
      <div className="mt-1 relative">
        <input
          type={show ? 'text' : 'password'}
          {...register(id)}
          className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-violet-500 focus:border-violet-500 sm:text-sm ${
            error ? 'border-red-300' : 'border-gray-200'
          }`}
          {...rest}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
        >
          {show ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gray-50 rounded-lg">
            <Shield className="h-5 w-5 text-gray-400" />
          </div>
          <div>
            <h2 className="text-base font-medium text-gray-900">Segurança da Conta</h2>
            <p className="text-sm text-gray-500">
              Mantenha sua conta segura alterando sua senha periodicamente
            </p>
          </div>
        </div>

        {!showPasswordForm ? (
          <div className="space-y-4">
            <div className="bg-violet-50 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <KeyRound className="h-5 w-5 text-violet-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-violet-800">
                    Requisitos para uma senha forte
                  </h3>
                  <div className="mt-2 text-sm text-violet-700">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Mínimo de 8 caracteres</li>
                      <li>Pelo menos uma letra maiúscula</li>
                      <li>Pelo menos uma letra minúscula</li>
                      <li>Pelo menos um número</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowPasswordForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
            >
              Alterar Senha
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
            <PasswordInput
              id="currentPassword"
              label="Senha Atual"
              show={showCurrentPassword}
              setShow={setShowCurrentPassword}
              error={errors.currentPassword?.message}
            />

            <PasswordInput
              id="newPassword"
              label="Nova Senha"
              show={showNewPassword}
              setShow={setShowNewPassword}
              error={errors.newPassword?.message}
            />

            <PasswordInput
              id="confirmPassword"
              label="Confirmar Nova Senha"
              show={showConfirmPassword}
              setShow={setShowConfirmPassword}
              error={errors.confirmPassword?.message}
            />

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Alterando...' : 'Salvar Nova Senha'}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setShowPasswordForm(false);
                  reset();
                }}
                className="flex-1 inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
