'use client';

import { use, useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useDashboardStore, Widget } from '@/store/useDashboardStore';
import { ArrowLeft, RefreshCw, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWidgetData } from '@/hooks/useWidgetData';
import { getValueByPath } from '@/lib/api-helper';
import { SimpleChart } from '@/components/widgets/visualizations/SimpleChart';
import { DataTable } from '@/components/widgets/visualizations/DataTable';
import Link from 'next/link';

// Helper to determine data source (similar to our fix in visualizations)
function getArrayData(data: any, selectedFields: string[]) {
    if (!data || !selectedFields.length) return { arrayPath: '', rows: [] };
    const arrayField = selectedFields.find(f => f.includes('[]')) || selectedFields[0];
    const bracketIndex = arrayField.indexOf('[]');
    const arrayPath = bracketIndex !== -1 ? arrayField.substring(0, bracketIndex + 2) : '';
    
    // Fallback if no array path found, return empty array?
    // Or maybe the data *is* the array if path is empty?
    // For now use our helper
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = getValueByPath(data, arrayPath);
    return { arrayPath, rows: Array.isArray(rows) ? rows : [] };
}

export default function WidgetDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const widget = useDashboardStore((state) => state.widgets.find((w) => w.id === id));
    
    // We can reuse the useWidgetData hook to get fresh data/loading/error
    // But we need to handle "widget not found" first.
    
    if (!widget) {
       // Handle loading or not found
       return (
         <div className="min-h-screen flex items-center justify-center text-muted-foreground bg-background">
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-2">Widget Not Found</h1>
                <Link href="/" className="text-primary hover:underline">
                    Go back to Dashboard
                </Link>
            </div>
         </div>
       );
    }
    
    return <WidgetDetailsContent widget={widget} />;
}

function WidgetDetailsContent({ widget }: { widget: Widget }) {
    const router = useRouter();
    const { data: liveData, loading, error } = useWidgetData(widget);
    const data = liveData || widget.data.cachedData;

    const [activeTab, setActiveTab] = useState<'chart' | 'table' | 'json'>('chart');
    
    // --- Statistics Calculation ---
    const stats = useMemo(() => {
        if (!data || !widget.data.selectedFields?.length) return null;
        
        const { rows } = getArrayData(data, widget.data.selectedFields);
        if (!rows || rows.length < 2) return null;

        // Try to find a numeric field to use for price
        // Usually the second field in selection if first is date? Or just the first numeric one?
        // Let's mimic SimpleChart logic: Y-axis is usually the value.
        // If > 1 field, field[1] is Y. If 1 field, field[0] is Y.
        let valueField = widget.data.selectedFields[0];
        if (widget.data.selectedFields.length >= 2) {
             valueField = widget.data.selectedFields[1]; // Typically X, Y. So Y is at [1].
        }
        
        // Clean field path relative to the row
        // Recalculate array path to strip it
        const arrayField = widget.data.selectedFields.find(f => f.includes('[]')) || widget.data.selectedFields[0];
        const bracketIndex = arrayField.indexOf('[]');
        const arrayPath = bracketIndex !== -1 ? arrayField.substring(0, bracketIndex + 2) : '';
        
        const cleanKey = valueField.replace(arrayPath, '');
        const key = cleanKey.startsWith('/') || cleanKey.startsWith('.') ? cleanKey.slice(1) : cleanKey;

        // Assuming rows are time-ordered. 
        // AlphaVantage: usually reverse chronological (newest first).
        // Let's assume index 0 is newest.
        const current = getValueByPath(rows[0], key);
        const previous = getValueByPath(rows[1], key);
        
        const curVal = parseFloat(current);
        const prevVal = parseFloat(previous);
        
        if (isNaN(curVal) || isNaN(prevVal)) return null;

        const change = curVal - prevVal;
        const changePercent = (change / prevVal) * 100;

        return {
            current: curVal,
            change: change,
            changePercent: changePercent
        };
    }, [data, widget.data.selectedFields]);

    return (
        <div className="min-h-screen bg-background p-6 space-y-6">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">{widget.data.title}</h1>
                    <p className="text-muted-foreground text-sm mt-1 font-mono">
                        {new URL(widget.data.apiEndpoint).hostname}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => window.location.reload()} // Simple reload or re-trigger hook? Hook auto-refreshes.
                        className="flex items-center gap-2 px-4 py-2 bg-secondary/50 hover:bg-secondary text-secondary-foreground rounded-lg transition-colors text-sm font-medium"
                    >
                         {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                         Refresh
                    </button>
                    <button 
                        onClick={() => router.back()}
                        className="flex items-center gap-2 px-4 py-2 bg-secondary/50 hover:bg-secondary text-secondary-foreground rounded-lg transition-colors text-sm font-medium"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard 
                    label="Latest Close" 
                    value={stats ? stats.current.toFixed(2) : '-'} 
                />
                <StatsCard 
                    label="Change" 
                    value={stats ? (stats.change > 0 ? '+' : '') + stats.change.toFixed(2) : '-'} 
                    trend={stats ? (stats.change >= 0 ? 'up' : 'down') : undefined}
                    colored
                />
                <StatsCard 
                    label="Change %" 
                    value={stats ? (stats.changePercent > 0 ? '+' : '') + stats.changePercent.toFixed(2) + '%' : '-'} 
                    trend={stats ? (stats.changePercent >= 0 ? 'up' : 'down') : undefined}
                    colored
                />
            </div>

            {/* Tabs & Content */}
            <div className="space-y-4">
                {/* Tabs Config */}
                <div className="flex justify-center border-b border-border/40 pb-1">
                     <div className="flex gap-8">
                        {(['chart', 'table', 'json'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "pb-3 text-sm font-medium transition-all relative px-2 capitalize",
                                    activeTab === tab 
                                        ? "text-primary after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-primary" 
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {tab === 'json' ? 'Raw JSON' : tab}
                            </button>
                        ))}
                     </div>
                </div>

                {/* Content Area */}
                <div className="bg-card border border-border rounded-xl p-1 min-h-[500px]">
                    <div className="h-full w-full p-4">
                        {error && (
                            <div className="h-full flex items-center justify-center text-destructive">
                                {error}
                            </div>
                        )}
                        
                        {!error && !data && loading && (
                            <div className="h-full flex items-center justify-center">
                                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        )}

                        {!error && data && activeTab === 'chart' && (
                             <div className="h-[500px] w-full">
                                <h3 className="text-sm font-medium text-muted-foreground mb-4">Price (Close)</h3>
                                <SimpleChart data={data} selectedFields={widget.data.selectedFields || []} />
                             </div>
                        )}

                        {!error && data && activeTab === 'table' && (
                            <div className="h-[500px] w-full overflow-hidden flex flex-col">
                                <DataTable data={data} selectedFields={widget.data.selectedFields || []} />
                            </div>
                        )}

                        {!error && data && activeTab === 'json' && (
                            <div className="h-[500px] w-full overflow-auto rounded-lg bg-muted/30 p-4 border border-border">
                                <h3 className="text-sm font-medium text-muted-foreground mb-4">Raw Response</h3>
                                <pre className="text-xs font-mono text-foreground/80 leading-relaxed">
                                    {JSON.stringify(data, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
}

function StatsCard({ label, value, trend, colored }: { label: string, value: string | number, trend?: 'up' | 'down', colored?: boolean }) {
    const isPositive = trend === 'up';
    const isNegative = trend === 'down';
    
    return (
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col justify-center gap-2 relative overflow-hidden group">
            {/* Subtle Gradient Background */}
             <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <span className="text-sm font-medium text-muted-foreground z-10">{label}</span>
            <span className={cn(
                "text-3xl font-bold tracking-tight z-10",
                colored && isPositive && "text-blue-500", // Using blue for positive as per screenshot
                colored && isNegative && "text-red-500",
                !colored && "text-foreground"
            )}>
                {value}
            </span>
        </div>
    )
}
