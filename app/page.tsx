'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { DashboardGrid } from '@/components/layout/DashboardGrid';
import { useDashboardStore } from '@/store/useDashboardStore';
import { AddWidgetModal } from '@/components/widgets/AddWidgetModal';

export default function Home() {
  const [isAddWidgetOpen, setIsAddWidgetOpen] = useState(false);
  
  // Hydration fix for persisted store
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  if (!isMounted) return null;

  return (
    <main className="min-h-screen bg-background text-foreground bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-background to-background">
      <Header onAddWidget={() => setIsAddWidgetOpen(true)} />
      
      <div className="container mx-auto">
        <DashboardGrid onAddWidget={() => setIsAddWidgetOpen(true)} />
      </div>

      {isAddWidgetOpen && (
        <AddWidgetModal onClose={() => setIsAddWidgetOpen(false)} />
      )}
    </main>
  );
}
