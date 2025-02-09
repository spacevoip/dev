import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { usePlanInfo } from '../../hooks/usePlanInfo';
import { calculateExpirationStatus } from '../../utils/dateUtils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import { Badge } from "../ui/badge";

export const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser } = useCurrentUser();
  const { planInfo } = usePlanInfo(currentUser?.plano);
  const [readNotifications, setReadNotifications] = useState<Set<string>>(new Set());

  // Carregar notificações lidas do localStorage ao iniciar
  useEffect(() => {
    const savedReadNotifications = localStorage.getItem('readNotifications');
    if (savedReadNotifications) {
      setReadNotifications(new Set(JSON.parse(savedReadNotifications)));
    }
  }, []);

  // Usar a função calculateExpirationStatus para verificar vencimento
  const expirationInfo = currentUser?.created_at && planInfo?.validade 
    ? calculateExpirationStatus(currentUser.created_at, planInfo.validade)
    : null;

  // Gerar notificações baseadas no status do plano
  const notifications = [];

  if (expirationInfo?.status === 'warning' && expirationInfo.daysUntilExpiration > 1) {
    notifications.push({
      id: 'plan-expiration',
      title: 'Seu plano está próximo do vencimento',
      message: `Faltam ${expirationInfo.daysUntilExpiration} dias para o vencimento do seu plano. Renove agora para evitar interrupções.`,
      type: 'warning' as const,
      timestamp: new Date().toISOString(),
      read: readNotifications.has('plan-expiration')
    });
  } else if (expirationInfo?.daysUntilExpiration === 1) {
    notifications.push({
      id: 'plan-expiration-tomorrow',
      title: 'Seu Plano Vence Amanhã',
      message: 'Seu Plano Vence Amanhã, Renove Agora',
      type: 'warning' as const,
      timestamp: new Date().toISOString(),
      read: readNotifications.has('plan-expiration-tomorrow')
    });
  } else if (expirationInfo?.isExpired) {
    notifications.push({
      id: 'plan-expired',
      title: 'Plano Vencido',
      message: 'Seu Plano está vencido, renove agora e evite que seus ramais sejam excluidos!',
      type: 'error' as const,
      timestamp: new Date().toISOString(),
      read: readNotifications.has('plan-expired')
    });
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (notificationId: string) => {
    const newReadNotifications = new Set(readNotifications);
    newReadNotifications.add(notificationId);
    setReadNotifications(newReadNotifications);
    localStorage.setItem('readNotifications', JSON.stringify([...newReadNotifications]));
  };

  const handleMarkAllAsRead = () => {
    const newReadNotifications = new Set(notifications.map(n => n.id));
    setReadNotifications(newReadNotifications);
    localStorage.setItem('readNotifications', JSON.stringify([...newReadNotifications]));
  };

  const getIcon = (type: 'info' | 'warning' | 'error') => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-5 w-5" />;
      case 'error':
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
          <Bell className="h-6 w-6 text-gray-600" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0"
            >
              {unreadCount}
            </Badge>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Notificações</h3>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-500">{unreadCount} não lidas</p>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Marcar todas como lidas
              </button>
            )}
          </div>
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              Nenhuma notificação
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                  className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`rounded-full p-2 ${
                      notification.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                      notification.type === 'error' ? 'bg-red-100 text-red-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notification.timestamp).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
