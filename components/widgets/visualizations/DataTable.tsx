import { getValueByPath } from '@/lib/api-helper';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface DataTableProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  selectedFields: string[];
}

interface DataTableProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  selectedFields: string[];
  compact?: boolean;
  formatting?: Record<string, 'default' | 'currency' | 'percent' | 'number'>;
}

export function DataTable({ data, selectedFields, compact, formatting }: DataTableProps) {

  if (!data || selectedFields.length === 0) return null;

  // Assume the first field dictates the array source to keep it simple
  // e.g. "data.items[].id" -> array path is "data.items[]"
  const arrayField = selectedFields.find(f => f.includes('[]'));
  let arrayPath = '';
  let rows: any[] = [];

  if (arrayField) {
      const bracketIndex = arrayField.indexOf('[]');
      arrayPath = arrayField.substring(0, bracketIndex + 2);
      const rawRows = getValueByPath(data, arrayPath);
      
      if (Array.isArray(rawRows)) {
          rows = rawRows;
      }
  } else {
      // Flat data - treat as single row
      rows = [data];
  }

  if (rows.length === 0) {
      return <div className="p-4 text-muted-foreground">No data found to display.</div>;
  }

  // Calculate columns based on selected fields relative to the array
  const columns = selectedFields.map(field => {
   
    let key = '';
    if (field.startsWith(arrayPath + '/')) {
        key = field.substring(arrayPath.length + 1);
    } else if (field.startsWith(arrayPath + '.')) {
        key = field.substring(arrayPath.length + 1);
    } else {
        key = field; // Should only happen if same path
    }

    // Label: last part of key
    const parts = key.split(/[/.]/);
    const label = parts[parts.length - 1] || key;
    
    return { field, key, label };
  });

  // Filter rows based on search
  const [search, setSearch] = useState('');
  
  const filteredRows = rows.filter(row => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    // Search in all selected columns
    return columns.some(col => {
       const val = getValueByPath(row, col.key);
       return String(val ?? '').toLowerCase().includes(searchLower);
    });
  });

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 50;
  const totalPages = Math.ceil(filteredRows.length / pageSize);
  
  const paginatedRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);

  // Reset page when search changes
  if (page > totalPages && totalPages > 0) {
      setPage(1);
  }

  return (
    <div className="h-full flex flex-col w-full">
      <div className="px-2 pb-2 flex justify-between items-center gap-2">
         <input 
           type="text" 
           placeholder={`Search ${rows.length} rows...`}
           value={search}
           onChange={(e) => { setSearch(e.target.value); setPage(1); }}
           className="flex-1 bg-muted/50 border border-border rounded-md px-3 py-1.5 text-sm focus:ring-1 focus:ring-primary outline-none"
         />
         {!compact && (
             <div className="text-xs text-muted-foreground whitespace-nowrap">
                 {filteredRows.length} items
             </div>
         )}
      </div>
      
      {!compact && (
      <div className="overflow-auto flex-1 border rounded-md border-border/50">
      <table className="w-full text-sm text-left">
        <thead className="bg-muted/80 sticky top-0 z-10 backdrop-blur-md text-xs uppercase tracking-wider">
          <tr>
            {columns.map(col => (
              <th key={col.field} className="px-4 py-2 font-medium text-muted-foreground border-b border-border/50">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50 bg-card">
          {paginatedRows.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-muted/20 transition-colors">
              {columns.map(col => {
                 const val = getValueByPath(row, col.key);
                 let displayVal = typeof val === 'object' && val !== null ? JSON.stringify(val) : String(val ?? '-');
                 
                 // Apply formatting
                 const format = formatting?.[col.field];
                 if (val !== null && val !== undefined) {
                     const num = parseFloat(String(val));
                     if (!isNaN(num) && isFinite(num) && String(val).trim() !== '' && !String(val).includes('-')) { // Avoid date-like things 2023-10-10 getting parsed as 2023
                          if (format === 'currency') {
                              displayVal = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
                          } else if (format === 'percent') {
                               displayVal = num.toLocaleString(undefined, { maximumFractionDigits: 2 }) + '%';
                          } else if (format === 'number') {
                              displayVal = num.toLocaleString(undefined, { maximumFractionDigits: 2 });
                          }
                     }
                 }

                 return (
                   <td key={col.field} className="px-4 py-2 text-foreground/80 truncate max-w-[150px] font-mono text-xs">
                      {displayVal}
                   </td>
                 );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {filteredRows.length === 0 && (
        <div className="p-8 text-center text-muted-foreground text-sm">No matching results found</div>
      )}
      </div>
      )}

      {/* Pagination Controls */}
      {!compact && totalPages > 1 && (
          <div className="flex items-center justify-between px-2 pt-2 text-xs">
              <span className="text-muted-foreground">
                  Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                  <button 
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="px-3 py-1 bg-muted rounded hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                      Prev
                  </button>
                  <button 
                    disabled={page === totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    className="px-3 py-1 bg-muted rounded hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                      Next
                  </button>
              </div>
          </div>
      )}
    </div>
  );
}
