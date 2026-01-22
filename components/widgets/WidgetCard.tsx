'use client';

import { Widget, useDashboardStore } from '@/store/useDashboardStore';
import { useWidgetData } from '@/hooks/useWidgetData';
import { PriceCard } from './visualizations/PriceCard';
import { DataTable } from './visualizations/DataTable';
import { SimpleChart } from './visualizations/SimpleChart';
import { Trash2, RefreshCw, AlertCircle, Settings, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function WidgetCard({ widget, onEdit }: { widget: Widget; onEdit?: () => void }) {
  const { removeWidget, isEditMode } = useDashboardStore();
  const { data, loading, error } = useWidgetData(widget);

  const renderContent = () => {
    // ... existing renderContent logic is fine, we don't change it here, wait
    // I need to include renderContent in replacement or use a targeted replacement for just the header part.
    // simpler to replace the top part.
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-destructive text-center p-4">
          <AlertCircle className="h-8 w-8 mb-2" />
          <p className="text-sm">{error}</p>
        </div>
      );
    }

    if (!data && loading) {
      return (
        <div className="flex items-center justify-center h-full">
           <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (!data) {
      return <div className="text-center text-muted-foreground p-4">No data</div>;
    }

    switch (widget.data.displayMode) {
      case 'price-card':
        return <PriceCard data={data} selectedFields={widget.data.selectedFields || []} />;
      case 'table':
        return <DataTable data={data} selectedFields={widget.data.selectedFields || []} compact={true} />;
      case 'chart':
        return <SimpleChart data={data} selectedFields={widget.data.selectedFields || []} />;
      default:
        return <PriceCard data={data} selectedFields={widget.data.selectedFields || []} />;
    }
  };

  return (
    <div className={cn(
      "relative flex flex-col h-full bg-card rounded-xl border border-border shadow-sm overflow-hidden transition-all duration-200",
      isEditMode && "ring-2 ring-primary/20 cursor-move hover:ring-primary/50"
    )}>
      
      {/* Widget Header */}
      <div className="flex flex-col gap-2 p-4 pb-0">
         <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-lg text-blue-500 truncate" title={widget.data.title}>
                {widget.data.title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                 <span className="px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 text-[10px] font-medium border border-orange-500/20">
                    {new URL(widget.data.apiEndpoint).hostname.split('.')[0] === 'www' ? new URL(widget.data.apiEndpoint).hostname.split('.')[1] : new URL(widget.data.apiEndpoint).hostname.split('.')[0]} 
                 </span>
                 <span className="text-[10px] text-muted-foreground">{widget.data.refreshInterval}s refresh</span>
              </div>
            </div>
         </div>
         
         <div className="flex gap-2 mt-1">
             <Link href={`/widget/${widget.id}`} className="flex-1">
                <button className="w-full flex items-center justify-center gap-2 px-3 py-1.5 bg-secondary/50 hover:bg-secondary text-secondary-foreground text-xs font-medium rounded-md transition-colors">
                    <Eye className="h-3.5 w-3.5" />
                    View
                </button>
             </Link>
             {isEditMode && (
                <button 
                  onClick={() => removeWidget(widget.id)}
                  className="px-3 py-1.5 bg-destructive/10 hover:bg-destructive/20 text-destructive text-xs font-medium rounded-md transition-colors"
                >
                   <Trash2 className="h-3.5 w-3.5" />
                </button>
             )}
         </div>
      </div>

      {/* Widget Content */}
      <div className="flex-1 p-4 overflow-hidden relative">
        {renderContent()}
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2 bg-muted/10 text-[10px] text-muted-foreground border-t border-border flex justify-between">
         <span>{widget.data.refreshInterval}s refresh</span>
         <span>Last updated: {widget.data.lastUpdated ? new Date(widget.data.lastUpdated).toLocaleTimeString() : 'Never'}</span>
      </div>
    </div>
  );
}
