import React, { useState } from 'react';
import { Eye, EyeOff, RefreshCw } from 'lucide-react';

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
  optional?: boolean;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  value,
  onChange,
  onGenerate,
  optional = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Password {optional && <span className="text-gray-500">(opcional)</span>}
      </label>
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 pr-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required={!optional}
          placeholder={optional ? 'Deixe em branco para manter a senha atual' : ''}
        />
        <div className="absolute right-0 top-0 h-full flex items-center gap-1 pr-2">
          <button
            type="button"
            onClick={onGenerate}
            className="p-1.5 text-gray-500 hover:text-gray-700"
            title="Generate Password"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="p-1.5 text-gray-500 hover:text-gray-700"
            title={showPassword ? 'Hide Password' : 'Show Password'}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
