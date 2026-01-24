'use client';

import { Widget, useDashboardStore } from '@/store/useDashboardStore';
import { useWidgetData } from '@/hooks/useWidgetData';
import { PriceCard } from './visualizations/PriceCard';
import { DataTable } from './visualizations/DataTable';
import { SimpleChart } from './visualizations/SimpleChart';
import { Trash2, RefreshCw, AlertCircle, Settings, Eye, LayoutGrid } from 'lucide-react';
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
        return <PriceCard data={data} selectedFields={widget.data.selectedFields || []} formatting={widget.data.fieldFormatting} />;
      case 'table':
        return <DataTable data={data} selectedFields={widget.data.selectedFields || []} compact={true} />;
      case 'chart':
        return <SimpleChart data={data} selectedFields={widget.data.selectedFields || []} />;
      default:
        return <PriceCard data={data} selectedFields={widget.data.selectedFields || []} formatting={widget.data.fieldFormatting} />;
    }
  };

  return (
    <div className={cn(
      "relative flex flex-col h-full bg-[#0b1221] rounded-xl border border-gray-800 shadow-sm overflow-hidden transition-all duration-200 group",
      isEditMode && "ring-2 ring-primary/20 cursor-move hover:ring-primary/50"
    )}>
      
      {/* Widget Header */}
      <div className="flex items-center justify-between p-4 pb-2">
         <div className="flex items-center gap-3">
            <LayoutGrid className="h-5 w-5 text-gray-400" />
            <h3 className="font-bold text-base text-white truncate max-w-[120px]" title={widget.data.title}>
              {widget.data.title}
            </h3>
            <span className="px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 text-[10px] font-medium border border-gray-700">
               {widget.data.refreshInterval}s
            </span>
         </div>
         <div className="flex items-center gap-1 opacity-100 transition-opacity">
             <button className="p-1.5 text-gray-400 hover:text-white transition-colors" onClick={() => window.location.reload()}>
                 <RefreshCw className="h-3.5 w-3.5" />
             </button>
             <button 
                onClick={onEdit}
                className="p-1.5 text-gray-400 hover:text-white transition-colors"
                title="Configure Widget"
             >
                <Settings className="h-3.5 w-3.5" />
             </button>
             <Link href={`/widget/${widget.id}`}>
                 <button className="p-1.5 text-gray-400 hover:text-white transition-colors" title="View Details">
                    <Eye className="h-3.5 w-3.5" />
                 </button>
             </Link>
             <button 
               onClick={() => removeWidget(widget.id)}
               className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
             >
                 <Trash2 className="h-3.5 w-3.5" />
             </button>
         </div>
      </div>

      {/* Widget Content */}
      <div className="flex-1 px-4 py-2 overflow-hidden relative flex flex-col justify-center">
        {renderContent()}
      </div>

      {/* Footer Info */}
      <div className="pb-3 pt-1 text-center">
         <p className="text-[10px] text-gray-500 font-medium">
            Last updated: {widget.data.lastUpdated ? new Date(widget.data.lastUpdated).toLocaleTimeString() : 'Never'}
         </p>
      </div>
    </div>
  );
}
