import { getValueByPath } from '@/lib/api-helper';
import { cn } from '@/lib/utils';

interface PriceCardProps {
  data: any;
  selectedFields: string[];
}

export function PriceCard({ data, selectedFields }: PriceCardProps) {
  if (!data) return null;

  return (
    <div className="flex flex-col gap-4 h-full justify-center">
      {selectedFields.map((field, index) => {
        const value = getValueByPath(data, field);
        // Robust label extraction
        const parts = field.split(/[/.]/);
        const label = parts[parts.length - 1] || field;
        
        // Emphasize the first field as primary
        const isPrimary = index === 0;

        return (
          <div key={field} className="flex justify-between items-baseline border-b border-border/50 pb-2 last:border-0 last:pb-0">
             <span className="text-sm text-muted-foreground capitalize">{label}</span>
             <span className={cn(
               "font-mono font-medium truncate ml-2",
               isPrimary ? "text-2xl text-foreground" : "text-lg text-foreground/80"
             )}>
                {typeof value === 'object' ? JSON.stringify(value) : String(value ?? '-')}
             </span>
          </div>
        );
      })}
    </div>
  );
}
