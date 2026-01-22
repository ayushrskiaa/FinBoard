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
}

export function DataTable({ data, selectedFields, compact }: DataTableProps) {
  if (!data || selectedFields.length === 0) return null;

  // Assume the first field dictates the array source to keep it simple
  // e.g. "data.items[].id" -> array path is "data.items[]"
  // Prioritize finding an array field to determine the main data source
  const arrayField = selectedFields.find(f => f.includes('[]')) || selectedFields[0];
  const bracketIndex = arrayField.indexOf('[]');
  const arrayPath = bracketIndex !== -1 ? arrayField.substring(0, bracketIndex + 2) : '';
  
  // If no array path found, fallback to just displaying single values in a list (technically generic table)
  if (!arrayPath || arrayPath === arrayField) {
      // Not an array property selection, or user selected the array itself
      return <div className="p-4 text-muted-foreground">Select specific fields inside an array for the table view.</div>;
  }

  // Get the array data
  const rows = getValueByPath(data, arrayPath);

  if (!Array.isArray(rows)) {
    return <div className="p-4 text-muted-foreground">No array data found at {arrayPath}</div>;
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

  return (
    <div className="h-full flex flex-col w-full">
      <div className="px-2 pb-2">
         <input 
           type="text" 
           placeholder="Search table..." 
           value={search}
           onChange={(e) => setSearch(e.target.value)}
           className="w-full bg-muted/50 border border-border rounded-md px-3 py-1 text-sm focus:ring-1 focus:ring-primary outline-none"
         />
      </div>
      {!compact && (
      <div className="overflow-auto flex-1">
      <table className="w-full text-sm text-left">
        <thead className="bg-muted/50 sticky top-0 z-10 backdrop-blur-md">
          <tr>
            {columns.map(col => (
              <th key={col.field} className="px-4 py-2 font-medium text-muted-foreground">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {filteredRows.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-muted/20 transition-colors">
              {columns.map(col => {
                 const val = getValueByPath(row, col.key);
                 return (
                   <td key={col.field} className="px-4 py-2 text-foreground truncate max-w-[150px]">
                      {typeof val === 'object' ? JSON.stringify(val) : String(val ?? '-')}
                   </td>
                 );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {filteredRows.length === 0 && (
        <div className="p-4 text-center text-muted-foreground text-xs">No matching results</div>
      )}
      </div>
      )}
    </div>
  );
}
