import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  link: string;
}

const ServiceCard = ({ icon: Icon, title, link }: ServiceCardProps) => {
  return (
    <div className="bg-white rounded-lg p-6 text-center flex flex-col items-center space-y-4 shadow-lg hover:shadow-xl transition-shadow">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
        <Icon className="w-8 h-8 text-black" />
      </div>
      <h3 className="text-gray-800 font-semibold">{title}</h3>
      <a
        href={link}
        className="text-primary hover:text-primary-dark text-sm font-medium"
      >
        Saiba mais
      </a>
    </div>
  );
};

export default ServiceCard;