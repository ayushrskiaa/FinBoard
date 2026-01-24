'use client';

import { Widget, useDashboardStore } from '@/store/useDashboardStore';
import { useWidgetData } from '@/hooks/useWidgetData';
import { PriceCard } from './visualizations/PriceCard';
import { DataTable } from './visualizations/DataTable';
import { SimpleChart } from './visualizations/SimpleChart';
import { Trash2, RefreshCw, AlertCircle, Settings, Eye, LayoutGrid, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function WidgetCard({ widget, onEdit }: { widget: Widget; onEdit?: () => void }) {
  const { removeWidget, isEditMode } = useDashboardStore();
  const { data, loading, error } = useWidgetData(widget);

  const renderContent = () => {
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-destructive text-center p-4">
          <AlertCircle className="h-8 w-8 mb-2 opacity-50" />
          <p className="text-sm opacity-75">{error}</p>
        </div>
      );
    }

    if (!data && loading) {
      return (
        <div className="flex items-center justify-center h-full">
           <div className="relative">
             <RefreshCw className="h-6 w-6 animate-spin text-primary" />
             <div className="absolute inset-0 h-6 w-6 rounded-full bg-primary/20 animate-ping"></div>
           </div>
        </div>
      );
    }

    if (!data) {
      return <div className="text-center text-muted-foreground p-4">No data</div>;
    }

    return <PriceCard data={data} selectedFields={widget?.data?.selectedFields || []} formatting={widget?.data?.fieldFormatting} error={error} />;
  };

  return (
    <div className={cn(
      "relative flex flex-col h-full glass rounded-2xl border border-white/10 shadow-xl overflow-hidden transition-all duration-300 group hover:shadow-2xl hover:shadow-primary/10",
      isEditMode && "ring-2 ring-primary/30 cursor-move hover:ring-primary/60 hover:scale-[1.02]"
    )}>
      
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      
      <div className="relative flex items-center justify-between p-5 pb-3 border-b border-white/5">
         <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground truncate max-w-[140px] group-hover:text-primary transition-colors" title={widget?.data?.title}>
                {widget?.data?.title || 'Untitled Widget'}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-semibold border border-primary/20">
                   {widget?.data?.refreshInterval || 30}s
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Auto-refresh
                </span>
              </div>
            </div>
         </div>
         <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
             <button 
               className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-200 hover:scale-110" 
               onClick={(e) => { e.stopPropagation(); window.location.reload(); }}
               title="Refresh"
             >
                 <RefreshCw className="h-4 w-4" />
             </button>
             <button 
                onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
                className="p-2 text-muted-foreground hover:text-secondary hover:bg-secondary/10 rounded-lg transition-all duration-200 hover:scale-110"
                title="Configure Widget"
             >
                <Settings className="h-4 w-4" />
             </button>
             <button 
               onClick={(e) => { e.stopPropagation(); removeWidget(widget.id); }}
               className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all duration-200 hover:scale-110"
               title="Delete Widget"
             >
                 <Trash2 className="h-4 w-4" />
             </button>
         </div>
      </div>

      <Link 
        href={`/widget/${widget.id}`} 
        className="relative flex-1 px-5 py-8 overflow-hidden flex flex-col justify-center cursor-pointer hover:bg-white/5 transition-all duration-200 group/content"
      >
        {renderContent()}
      </Link>

      <div className="relative px-5 py-3 border-t border-white/5 bg-black/20">
         <div className="flex items-center justify-between">
           <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse"></div>
              Last updated: {widget?.data?.lastUpdated ? new Date(widget.data.lastUpdated).toLocaleTimeString() : 'Never'}
           </p>
           <div className="text-[10px] text-muted-foreground/50">
             ID: {widget.id.slice(0, 8)}
           </div>
         </div>
      </div>
    </div>
  );
}
