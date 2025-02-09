import { Phone, Headphones, MessageSquare, Users, Bot, Network, PhoneCall } from 'lucide-react';
import { MenuItem } from './types';

export const solutions: MenuItem[] = [
  {
    name: 'PABX em Nuvem',
    description: 'Central telefônica completa e flexível',
    href: '/pricing',
    icon: Phone
  },
  {
    name: 'Call Center',
    description: 'Gestão completa de atendimento',
    href: '/pricing',
    icon: Headphones
  },
  {
    name: 'Discador Automático',
    description: 'Automatize suas campanhas de ligações',
    href: '/auto-dialer',
    icon: PhoneCall
  },
  {
    name: 'Omnichannel',
    description: 'Integração de canais de comunicação',
    href: '/pricing',
    icon: MessageSquare
  },
  {
    name: 'Tele Atendimento',
    description: 'Terceirização profissional',
    href: '/pricing',
    icon: Users
  },
  {
    name: 'Automação',
    description: 'Automatize com inteligência',
    href: '/pricing',
    icon: Bot
  },
  {
    name: 'SIP Trunk',
    description: 'Telefonia IP empresarial',
    href: '/pricing',
    icon: Network
  }
];