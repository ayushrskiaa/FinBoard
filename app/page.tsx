'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { DashboardGrid } from '@/components/layout/DashboardGrid';
import { useDashboardStore } from '@/store/useDashboardStore';
import { AddWidgetModal } from '@/components/widgets/AddWidgetModal';
import { TrendingUp, Zap, Shield } from 'lucide-react';

import { Widget } from '@/store/useDashboardStore';

export default function Home() {
  const [isAddWidgetOpen, setIsAddWidgetOpen] = useState(false);
  const [editingWidget, setEditingWidget] = useState<Widget | undefined>(undefined);
  const widgets = useDashboardStore((state) => state.widgets);
  
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

  const showHero = widgets.length === 0;

  return (
    <main className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Animated background gradients */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-secondary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-accent/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <Header onAddWidget={() => setIsAddWidgetOpen(true)} />
      
      <div className="container mx-auto px-4 py-8">
        {showHero && (
          <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Hero Section */}
            <div className="text-center mb-16 pt-12">
              <div className="inline-block mb-4">
                <span className="px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium backdrop-blur-sm">
                  Real-time Financial Intelligence
                </span>
              </div>
              
              <h1 className="text-6xl md:text-7xl font-bold mb-6 text-foreground">
                FinBoard
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto animate-in fade-in duration-700 delay-200">
                Your ultimate financial dashboard. Track markets, monitor assets, and make informed decisions with real-time data from multiple sources.
              </p>

              <div className="flex flex-wrap gap-4 justify-center mb-12 animate-in fade-in duration-700 delay-300">
                <button
                  onClick={() => setIsAddWidgetOpen(true)}
                  className="px-8 py-4 bg-primary text-white rounded-lg font-semibold shadow-lg hover:bg-primary/90 transition-all duration-200 hover:scale-105 flex items-center gap-2"
                >
                  <Zap className="w-5 h-5" />
                  Get Started
                </button>
                
                <button
                  className="px-8 py-4 bg-secondary text-foreground rounded-lg font-semibold hover:bg-secondary/80 transition-all duration-200 flex items-center gap-2"
                >
                  <Shield className="w-5 h-5" />
                  Learn More
                </button>
              </div>

              {/* Feature Cards */}
              <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto animate-in fade-in duration-700 delay-400">
                <div className="glass p-6 rounded-2xl hover:bg-white/10 transition-all duration-300 group">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Real-time Data</h3>
                  <p className="text-muted-foreground text-sm">
                    Live market data from Finnhub, Alpha Vantage, Coinbase, and more
                  </p>
                </div>

                <div className="glass p-6 rounded-2xl hover:bg-white/10 transition-all duration-300 group">
                  <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Customizable Widgets</h3>
                  <p className="text-muted-foreground text-sm">
                    Create, resize, and arrange widgets to match your workflow
                  </p>
                </div>

                <div className="glass p-6 rounded-2xl hover:bg-white/10 transition-all duration-300 group">
                  <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Multiple Views</h3>
                  <p className="text-muted-foreground text-sm">
                    Charts, tables, and cards - visualize data your way
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <DashboardGrid 
            onAddWidget={() => setIsAddWidgetOpen(true)} 
            onEditWidget={handleEditWidget}
        />
      </div>

      {isAddWidgetOpen && (
        <AddWidgetModal 
            onClose={handleCloseModal} 
            initialWidget={editingWidget}
        />
      )}

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </main>
  );
}
