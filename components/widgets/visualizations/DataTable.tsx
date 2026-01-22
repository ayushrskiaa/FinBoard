import { getValueByPath } from '@/lib/api-helper';
import { cn } from '@/lib/utils';

interface DataTableProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  selectedFields: string[];
}

export function DataTable({ data, selectedFields }: DataTableProps) {
  if (!data || selectedFields.length === 0) return null;

  // Assume the first field dictates the array source to keep it simple
  // e.g. "data.items[].id" -> array path is "data.items[]"
  const firstField = selectedFields[0];
  const arrayPath = firstField.substring(0, firstField.lastIndexOf('[]') + 2);
  
  // If no array path found, fallback to just displaying single values in a list (technically generic table)
  if (!arrayPath || arrayPath === firstField) {
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
    // extract "price" from "items[].price"
    const key = field.replace(arrayPath + '.', '');
    const label = key.split('.').pop() || key;
    return { field, key, label };
  });

  return (
    <div className="h-full overflow-auto w-full">
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
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-muted/20 transition-colors">
              {columns.map(col => {
                 // We need to resolve the value from the ROW object, using the relative key
                 // We can use our helper, but we need to handle deep keys inside the row
                 // getValueByPathSimple logic is needed here basically, but getValueByPath handles '.' splitting
                 // However, getValueByPath expects full path or simple object access.
                 // Let's reuse getValueByPath logic but locally or import the simple one if exported (it wasn't).
                 // We can just use the global helper with a constructed path or modify helper.
                 // Actually, getValueByPath(row, col.key) should work if col.key is "price" or "nested.price"
                 // because getValueByPath handles simple paths too if no '[]' is present.
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
    </div>
  );
}
