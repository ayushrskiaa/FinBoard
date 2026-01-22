'use client';

import { BarChart3, Plus, Settings2, LayoutTemplate } from 'lucide-react';
import { useDashboardStore } from '@/store/useDashboardStore';
import { cn } from '@/lib/utils';

import { ThemeToggle } from '@/components/ui/ThemeToggle';

export function Header({ onAddWidget }: { onAddWidget: () => void }) {
  const { isEditMode, toggleEditMode, widgets } = useDashboardStore();

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">FinBoard</h1>
            <p className="text-xs text-muted-foreground">
              {widgets.length} active widget{widgets.length !== 1 ? 's' : ''} • Real-time data
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
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
