import { LucideIcon } from 'lucide-react';

export interface MenuItem {
  name: string;
  description?: string;
  href: string;
  icon?: LucideIcon;
}