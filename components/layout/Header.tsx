'use client';

import { BarChart3, Plus, Settings2, LayoutTemplate, Download, Upload } from 'lucide-react';
import { useDashboardStore } from '@/store/useDashboardStore';
import { cn } from '@/lib/utils';
import Link from 'next/link';

import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useRef } from 'react';

export function Header({ onAddWidget }: { onAddWidget: () => void }) {
  const { isEditMode, toggleEditMode, widgets, reorderWidgets } = useDashboardStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = JSON.stringify({ widgets }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finboard-config-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json.widgets)) {
           if (confirm('This will replace your current dashboard. Continue?')) {
             reorderWidgets(json.widgets);
           }
        } else {
           alert('Invalid configuration file');
        }
      } catch (err) {
        alert('Failed to parse file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">FinBoard</h1>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{widgets.length} active widget{widgets.length !== 1 ? 's' : ''}</span>
              <span>•</span>
              <Link href="/faq" className="hover:text-primary transition-colors underline decoration-dotted underline-offset-2">
                 Help & FAQ
              </Link>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 mr-2">
             <button 
               onClick={handleExport}
               className="p-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-accent transition-colors"
               title="Export Config"
             >
               <Download className="h-4 w-4" />
             </button>
             <button 
               onClick={() => fileInputRef.current?.click()}
               className="p-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-accent transition-colors"
               title="Import Config"
             >
               <Upload className="h-4 w-4" />
             </button>
             <input 
               type="file" 
               ref={fileInputRef} 
               className="hidden" 
               accept=".json"
               onChange={handleImport}
             />
          </div>

          <ThemeToggle />
          <div className="h-6 w-px bg-border mx-1" />
          <button
            onClick={toggleEditMode}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md transition-colors text-sm font-medium",
              isEditMode 
                ? "bg-accent text-accent-foreground" 
                : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"
            )}
          >
            <LayoutTemplate className="h-4 w-4" />
            {isEditMode ? 'Done Editing' : 'Edit Layout'}
          </button>
          
          <button
            onClick={onAddWidget}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            Add Widget
          </button>
        </div>
      </div>
    </header>
  );
}
