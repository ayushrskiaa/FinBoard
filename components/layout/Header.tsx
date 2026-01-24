'use client';

import { BarChart3, Plus, Settings2, LayoutTemplate, Download, Upload, Sparkles } from 'lucide-react';
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
    <header className="glass sticky top-0 z-50 border-b border-white/10">
      <div className="container flex h-20 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center shadow-md">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              FinBoard
            </h1>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-accent"></div>
                <span className="font-medium">{widgets.length} active widget{widgets.length !== 1 ? 's' : ''}</span>
              </div>
              <span className="text-border">•</span>
              <Link 
                href="/faq" 
                className="hover:text-primary transition-colors"
              >
                Help & FAQ
              </Link>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Action buttons with modern styling */}
          <div className="flex items-center gap-1 mr-2 glass rounded-lg p-1">
             <button 
               onClick={handleExport}
               className="p-2.5 text-muted-foreground hover:text-primary rounded-md hover:bg-white/10 transition-all duration-200 group"
               title="Export Config"
             >
               <Download className="h-4 w-4 group-hover:scale-110 transition-transform" />
             </button>
             <button 
               onClick={() => fileInputRef.current?.click()}
               className="p-2.5 text-muted-foreground hover:text-secondary rounded-md hover:bg-white/10 transition-all duration-200 group"
               title="Import Config"
             >
               <Upload className="h-4 w-4 group-hover:scale-110 transition-transform" />
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
          
          <div className="h-8 w-px bg-gradient-to-b from-transparent via-border to-transparent mx-1" />
          
          <button
            onClick={toggleEditMode}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium",
              isEditMode 
                ? "bg-accent text-white" 
                : "bg-secondary hover:bg-secondary/80 text-foreground"
            )}
          >
            <LayoutTemplate className="h-4 w-4" />
            {isEditMode ? 'Done Editing' : 'Edit Layout'}
          </button>
          
          <button
            onClick={onAddWidget}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-all duration-200 text-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            Add Widget
          </button>
        </div>
      </div>
    </header>
  );
}
