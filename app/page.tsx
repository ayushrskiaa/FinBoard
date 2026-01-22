'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { DashboardGrid } from '@/components/layout/DashboardGrid';
import { useDashboardStore } from '@/store/useDashboardStore';
import { AddWidgetModal } from '@/components/widgets/AddWidgetModal';

import { Widget } from '@/store/useDashboardStore';

export default function Home() {
  const [isAddWidgetOpen, setIsAddWidgetOpen] = useState(false);
  const [editingWidget, setEditingWidget] = useState<Widget | undefined>(undefined);
  
  // Need to listen to custom event because WidgetCard is deep in the tree?
  // Or we can just pass a handler down? But WidgetCard is inside SortableItem inside DashboardGrid.
  // We can pass `onEditWidget` prop down. 
  
  // Hydration fix for persisted store
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  if (!isMounted) return null;

  const handleEditWidget = (widget: Widget) => {
      setEditingWidget(widget);
      setIsAddWidgetOpen(true);
  };

  const handleCloseModal = () => {
      setIsAddWidgetOpen(false);
      setEditingWidget(undefined);
  };

  return (
    <main className="min-h-screen bg-background text-foreground bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-background to-background">
      <Header onAddWidget={() => setIsAddWidgetOpen(true)} />
      
      <div className="container mx-auto">
        <DashboardGrid 
            onAddWidget={() => setIsAddWidgetOpen(true)} 
            onEditWidget={handleEditWidget} // We need to update DashboardGrid to accept this
        />
      </div>

      {isAddWidgetOpen && (
        <AddWidgetModal 
            onClose={handleCloseModal} 
            initialWidget={editingWidget}
        />
      )}
    </main>
  );
}
