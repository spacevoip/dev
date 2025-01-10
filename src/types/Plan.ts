export interface Plan {
  id: string;
  name: string;
  extensionsLimit: number;
  validity: number;
  isPopular?: boolean;
  features: string[];
}
