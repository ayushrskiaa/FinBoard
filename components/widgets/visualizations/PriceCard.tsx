import { getValueByPath } from '@/lib/api-helper';
import { cn } from '@/lib/utils';
import { AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';

interface PriceCardProps {
  data: any;
  selectedFields: string[];
  formatting?: Record<string, 'default' | 'currency' | 'percent' | 'number'>;
  error?: string | null;
}

export function PriceCard({ data, selectedFields, formatting, error }: PriceCardProps) {
  if (error) {
     const isNetworkBlock = error.includes('ENOTFOUND') || error.includes('fetch failed');
     return (
        <div className="h-full flex flex-col items-center justify-center text-red-400 p-6 text-center">
            <div className="relative mb-4">
              <AlertCircle className="h-12 w-12 opacity-50" />
              <div className="absolute inset-0 h-12 w-12 rounded-full bg-red-500/20 animate-ping"></div>
            </div>
            
            {isNetworkBlock ? (
                <div className="space-y-2">
                    <p className="text-sm font-semibold">Network Connection Failed</p>
                    <p className="text-xs text-red-400/70 max-w-[200px]">
                        The API is blocked on your network or DNS.
                    </p>
                    <div className="pt-3">
                        <span className="text-[10px] bg-red-500/10 px-3 py-1.5 rounded-lg text-red-300 border border-red-500/20 font-medium">
                            Try "Binance" or "CoinGecko" preset
                        </span>
                    </div>
                </div>
            ) : (
                <p className="text-xs opacity-75">{error}</p>
            )}
        </div>
     );
  }

  if (!data) return null;

  const isChangeField = (field: string) => {
    return field.toLowerCase().includes('change') || field.toLowerCase().includes('percent');
  };

  const getChangeColor = (value: any) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return '';
    return numValue >= 0 ? 'text-accent' : 'text-destructive';
  };

  return (
    <div className="flex flex-col justify-center w-full gap-2 p-1">
      {selectedFields.map((field, index) => {
        let value = getValueByPath(data, field);
        
        // If value is an array (e.g. from Time Series), take the first item (latest)
        if (Array.isArray(value) && value.length > 0) {
            value = value[0];
        }

        // Robust label extraction
        const parts = field.split(/[/.]/);
        const label = parts[parts.length - 1] || field;

        const isLast = index === selectedFields.length - 1;
        
        // Format value
        let displayValue = '-';
        const format = formatting?.[field] || 'default';

        if (typeof value === 'object' && value !== null) {
            displayValue = JSON.stringify(value);
        } else if (value !== undefined && value !== null) {
            const strVal = String(value);
            const num = parseFloat(strVal);

            if (!isNaN(num) && isFinite(num) && !strVal.includes('-')) {
                 if (format === 'currency') {
                     displayValue = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
                 } else if (format === 'percent') {
                     displayValue = num.toLocaleString(undefined, { maximumFractionDigits: 2 }) + '%';
                 } else if (format === 'number') {
                     displayValue = num.toLocaleString(undefined, { maximumFractionDigits: 2 });
                 } else {
                     displayValue = num.toLocaleString(undefined, { maximumFractionDigits: 2 });
                 }
            } else {
                 displayValue = strVal;
            }
        }

        const isChange = isChangeField(field);
        const changeColor = isChange ? getChangeColor(value) : '';
        const numValue = parseFloat(value);

        return (
          <div 
            key={field} 
            className={cn(
                "group relative flex justify-between items-center py-3 px-4 rounded-xl glass border border-white/5 hover:border-primary/30 transition-all duration-200 hover:scale-[1.01]",
                !isLast && "mb-1"
            )}
          >
            {/* Gradient background on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
            
            <div className="relative flex items-center gap-2 max-w-[55%]">
              {isChange && !isNaN(numValue) && (
                <div className={`p-1.5 rounded-lg ${numValue >= 0 ? 'bg-accent/10' : 'bg-destructive/10'}`}>
                  {numValue >= 0 ? (
                    <TrendingUp className="h-3.5 w-3.5 text-accent" />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5 text-destructive" />
                  )}
                </div>
              )}
              <span className="text-sm text-muted-foreground truncate font-medium capitalize">
                {label.replace(/_/g, ' ')}
              </span>
            </div>
            
            <span className={cn(
              "relative font-bold text-lg tracking-tight text-right truncate pl-4",
              changeColor || 'text-foreground'
            )}>
              {displayValue}
            </span>
          </div>
        );
      })}
      
      {selectedFields.length === 0 && (
        <div className="h-full flex items-center justify-center text-muted-foreground text-sm py-8">
          No fields selected
        </div>
      )}
    </div>
  );
}
