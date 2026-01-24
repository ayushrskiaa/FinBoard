import { getValueByPath } from '@/lib/api-helper';
import { cn } from '@/lib/utils';

interface PriceCardProps {
  data: any;
  selectedFields: string[];
  formatting?: Record<string, 'default' | 'currency' | 'percent' | 'number'>;
}

export function PriceCard({ data, selectedFields, formatting }: PriceCardProps) {
  if (!data) return null;

  return (
    <div className="flex flex-col justify-center w-full">
      {selectedFields.map((field, index) => {
        let value = getValueByPath(data, field);
        
        // If value is an array (e.g. from Time Series), take the first item (latest)
        if (Array.isArray(value) && value.length > 0) {
            value = value[0];
        }

        // Robust label extraction
        const parts = field.split(/[/.]/);
        const label = parts[parts.length - 1] || field;

        // Check if last item to avoid border
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
                     displayValue = new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 2 }).format(num / 100); // Assuming fractional? Or user raw?
                     // Usually APIs return 5.25 for 5.25%. Let's assume raw number for now, or just append %.
                     // Actually better just append % if it's already a number like 0.5 or 50.
                     // Let's assume the API returns the number and we just want to format it nicely.
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

        return (
          <div 
            key={field} 
            className={cn(
                "flex justify-between items-center py-4",
                !isLast && "border-b border-gray-800"
            )}
          >
             <span className="text-sm text-gray-500 font-medium capitalize">{label.replace(/_/g, ' ')}</span>
             <span className="font-bold text-white text-lg tracking-tight text-right truncate pl-4">
                {displayValue}
             </span>
          </div>
        );
      })}
    </div>
  );
}
