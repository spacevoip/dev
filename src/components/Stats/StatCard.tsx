import { Card, CardContent } from '../ui/card';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  loading?: boolean;
  trend?: {
    value: number;
    label: string;
  };
}

export function StatCard({ title, value, icon: Icon, description, loading, trend }: StatCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="rounded-lg bg-primary/10 p-2">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {title}
            </p>
            {loading ? (
              <div className="mt-1 h-7 w-24 animate-pulse rounded bg-gray-200" />
            ) : (
              <h3 className="mt-1 text-2xl font-semibold tracking-tight">
                {value}
              </h3>
            )}
          </div>
        </div>
        {(description || trend) && (
          <div className="mt-4 flex items-center justify-between border-t pt-4">
            {description && (
              <p className="text-sm text-muted-foreground">
                {description}
              </p>
            )}
            {trend && (
              <div className={`flex items-center gap-1 text-sm ${
                trend.value >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                <span>{trend.value}%</span>
                <span className="text-muted-foreground">{trend.label}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
