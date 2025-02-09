import React from 'react';
import type { AdminUser } from '../../../types/admin';

interface UserRoleBadgeProps {
  role: AdminUser['role'];
}

export const UserRoleBadge: React.FC<UserRoleBadgeProps> = ({ role }) => {
  const getBadgeStyles = () => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'support':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getBadgeStyles()}`}>
      {role}
    </span>
  );
};