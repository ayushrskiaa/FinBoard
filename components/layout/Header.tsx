'use client';

import { BarChart3, Plus, LayoutTemplate, Download, Upload, Menu } from 'lucide-react';
import { useDashboardStore } from '@/store/useDashboardStore';
import { cn } from '@/lib/utils';
import Link from 'next/link';

import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useRef, useState } from 'react';

export function Header({ onAddWidget }: { onAddWidget: () => void }) {
  const { isEditMode, toggleEditMode, widgets, reorderWidgets } = useDashboardStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      <div className="container flex h-16 md:h-20 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2 md:gap-4">
          <div className="relative h-8 w-8 md:h-10 md:w-10 rounded-lg bg-gradient-to-br from-primary to-accent shadow-lg">
            <div className="absolute inset-0 flex items-center justify-center">
              <svg viewBox="0 0 32 32" className="h-full w-full p-1">
                <path 
                  d="M 8 8 L 8 24 M 8 8 L 18 8 M 8 14 L 16 14" 
                  stroke="white" 
                  strokeWidth="2.5" 
                  strokeLinecap="round"
                  fill="none"
                />
                <rect x="20" y="18" width="2.5" height="6" rx="0.5" fill="white" opacity="0.7"/>
                <rect x="23" y="15" width="2.5" height="9" rx="0.5" fill="white" opacity="0.85"/>
                <rect x="26" y="12" width="2.5" height="12" rx="0.5" fill="white"/>
              </svg>
            </div>
          </div>
          
          <div>
            <h1 className="text-lg md:text-xl font-bold tracking-tight text-foreground">
              FinBoard
            </h1>
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-accent"></div>
                <span className="font-medium">{widgets.length} widget{widgets.length !== 1 ? 's' : ''}</span>
              </div>
              <span className="text-border">•</span>
              <Link 
                href="/faq" 
                className="hover:text-primary transition-colors"
              >
                Help
              </Link>
            </div>
          </div>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
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
            {isEditMode ? 'Done' : 'Edit'}
          </button>
          
          <button
            onClick={onAddWidget}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-all duration-200 text-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            Add Widget
          </button>
        </div>

        {/* Mobile Actions */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={onAddWidget}
            className="p-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-all duration-200"
            title="Add Widget"
          >
            <Plus className="h-5 w-5" />
          </button>
          
          <button
            onClick={toggleEditMode}
            className={cn(
              "p-2 rounded-lg transition-all duration-200",
              isEditMode 
                ? "bg-accent text-white" 
                : "bg-secondary text-foreground"
            )}
            title={isEditMode ? 'Done Editing' : 'Edit Layout'}
          >
            <LayoutTemplate className="h-5 w-5" />
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-all duration-200"
            title="Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-card/95 backdrop-blur-sm">
          <div className="container px-4 py-3 space-y-2">
            <button
              onClick={() => {
                handleExport();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-secondary/50 hover:bg-secondary text-foreground transition-colors"
            >
              <Download className="h-4 w-4" />
              <span className="text-sm font-medium">Export Config</span>
            </button>
            
            <button
              onClick={() => {
                fileInputRef.current?.click();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-secondary/50 hover:bg-secondary text-foreground transition-colors"
            >
              <Upload className="h-4 w-4" />
              <span className="text-sm font-medium">Import Config</span>
            </button>

            <Link
              href="/faq"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-secondary/50 hover:bg-secondary text-foreground transition-colors"
            >
              <span className="text-sm font-medium">Help & FAQ</span>
            </Link>

            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-muted-foreground">Theme</span>
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}

      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept=".json"
        onChange={handleImport}
      />
    </header>
  );
}
