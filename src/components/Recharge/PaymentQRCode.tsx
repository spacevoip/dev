import React, { useState, useEffect } from 'react';
import { X, Copy, RefreshCw, CheckCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface PaymentQRCodeProps {
  amount: number;
  onClose: () => void;
}

export const PaymentQRCode: React.FC<PaymentQRCodeProps> = ({ amount, onClose }) => {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [copied, setCopied] = useState(false);
  const [qrCodeKey, setQrCodeKey] = useState(Date.now());
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=example-pix-key-${qrCodeKey}`;
  const pixKey = '00000000-0000-0000-0000-000000000000';

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onClose]);

  const handleCopy = () => {
    navigator.clipboard.writeText(pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefresh = () => {
    setQrCodeKey(Date.now());
    setTimeLeft(300);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full transform transition-all duration-300 scale-100 animate-slideUp">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            Payment QR Code
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Total Amount</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              {formatCurrency(amount)}
            </p>
          </div>

          <div className="flex justify-center">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative bg-white p-4 rounded-2xl shadow-sm">
                <img
                  src={qrCodeUrl}
                  alt="Payment QR Code"
                  className="w-48 h-48"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <input
              type="text"
              value={pixKey}
              readOnly
              className="flex-1 bg-transparent text-sm font-medium"
            />
            <button
              onClick={handleCopy}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              title={copied ? 'Copied!' : 'Copy PIX key'}
            >
              {copied ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <Copy className="h-5 w-5" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-center">
              <p className="text-sm text-gray-600">QR Code expires in</p>
              <p className={`text-lg font-semibold ${
                timeLeft <= 60 ? 'text-red-600' : 'text-gray-900'
              }`}>
                {formatTime(timeLeft)}
              </p>
            </div>
            <button
              onClick={handleRefresh}
              className="p-2 text-violet-600 hover:text-violet-700 hover:bg-violet-50 rounded-lg transition-colors"
              title="Generate new QR code"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};