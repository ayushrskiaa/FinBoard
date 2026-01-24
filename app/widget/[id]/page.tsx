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
    
    // Fix hydration mismatch by ensuring we only render based on store data on client
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => setIsMounted(true), []);

    if (!isMounted) {
        return (
             <div className="min-h-screen flex items-center justify-center text-muted-foreground bg-background">
                <div className="flex flex-col items-center gap-2">
                    <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                    <p>Loading widget...</p>
                </div>
             </div>
        );
    }
    
    if (!widget) {
       // Handle loading or not found AFTER mount
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

    // --- Statistics Calculation ---
    const stats = useMemo(() => {
        if (!data) return null;

        // 1. Array Data (Time Series / List)
        if (Array.isArray(data) || (widget.data.selectedFields?.length && widget.data.selectedFields.some(f => f.includes('[]')))) {
            const { rows } = getArrayData(data, widget.data.selectedFields || []);
            if (!rows || rows.length < 2) return null;

            // Try to find a numeric field to use for price
            let valueField = widget.data.selectedFields![0];
            if (widget.data.selectedFields!.length >= 2) {
                 valueField = widget.data.selectedFields![1]; // Typically X, Y. So Y is at [1].
            }
            
            const arrayField = widget.data.selectedFields!.find(f => f.includes('[]')) || widget.data.selectedFields![0];
            const bracketIndex = arrayField.indexOf('[]');
            const arrayPath = bracketIndex !== -1 ? arrayField.substring(0, bracketIndex + 2) : '';
            
            const cleanKey = valueField.replace(arrayPath, '');
            const key = cleanKey.startsWith('/') || cleanKey.startsWith('.') ? cleanKey.slice(1) : cleanKey;

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
        }

        // 2. Finnhub Quote (c, d, dp)
        // Check for common Finnhub keys if specific structure matches
        if (data.c !== undefined && data.d !== undefined && data.dp !== undefined) {
             return {
                 current: data.c,
                 change: data.d,
                 changePercent: data.dp
             };
        }

        // 3. AlphaVantage Global Quote
        const gQuote = data['Global Quote'];
        if (gQuote) {
            const price = parseFloat(gQuote['05. price']);
            const change = parseFloat(gQuote['09. change']);
            const changePercentStr = gQuote['10. change percent'] || '';
            const changePercent = parseFloat(changePercentStr.replace('%', ''));
            
            if (!isNaN(price) && !isNaN(change)) {
                 return {
                     current: price,
                     change: change,
                     changePercent: isNaN(changePercent) ? 0 : changePercent
                 };
            }
        }
        
        // 4. Fallback for Coinbase / CoinCap single asset
        // CoinCap Asset: data.priceUsd, data.changePercent24Hr
        if (data.data && data.data.priceUsd && data.data.changePercent24Hr) {
             const price = parseFloat(data.data.priceUsd);
             const changeP = parseFloat(data.data.changePercent24Hr);
             // Approximate change value since we only have percent
             const change = price - (price / (1 + changeP/100)); // Current - Prev
             
             return {
                 current: price,
                 change: change,
                 changePercent: changeP
             };
        }

        return null;
    }, [data, widget.data.selectedFields]);

    const [activeTab, setActiveTab] = useState<'chart' | 'table' | 'json'>('json'); // Default to json mostly safe

    // Auto-select tab on mount/data load
    useEffect(() => {
        if (!data) return;
        // Prioritize Chart if we have array data suitable for it
        if (Array.isArray(data) || (widget.data.selectedFields?.some(f => f.includes('[]')))) {
             setActiveTab('chart');
        } else if (Array.isArray(data)) {
             setActiveTab('table');
        } else {
             setActiveTab('json');
        }
    }, [data, widget.data.selectedFields]);

    return (
        <div className="min-h-screen bg-background p-6 space-y-8">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
                        {widget.data.title}
                    </h1>
                    <div className="flex items-center gap-2 mt-2">
                        <div className="h-2 w-2 rounded-full bg-accent animate-pulse"></div>
                        <p className="text-muted-foreground text-sm font-medium">
                            {(() => {
                                try {
                                    return new URL(widget.data.apiEndpoint).hostname;
                                } catch {
                                    return 'Local Source';
                                }
                            })()}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => window.location.reload()}
                        className="flex items-center gap-2 px-5 py-2.5 glass hover:bg-white/10 rounded-xl transition-all duration-200 text-sm font-semibold hover:scale-105"
                    >
                         {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                         Refresh
                    </button>
                    <button 
                        onClick={() => router.back()}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-secondary text-white rounded-xl transition-all duration-200 text-sm font-semibold hover:scale-105 hover:shadow-lg hover:shadow-primary/50"
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
            <div className="space-y-6">
                {/* Tabs Config */}
                <div className="flex justify-center">
                     <div className="inline-flex gap-2 glass rounded-xl p-1.5">
                        {(['chart', 'table', 'json'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "px-6 py-2.5 text-sm font-semibold transition-all duration-200 rounded-lg capitalize",
                                    activeTab === tab 
                                        ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg" 
                                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                )}
                            >
                                {tab === 'json' ? 'Raw JSON' : tab}
                            </button>
                        ))}
                     </div>
                </div>

                {/* Content Area */}
                <div className="glass border border-white/10 rounded-2xl p-6 min-h-[500px] shadow-xl">
                    <div className="h-full w-full">
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
        <div className="glass border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col justify-center gap-3 relative overflow-hidden group hover:scale-105 transition-all duration-300">
            {/* Gradient Background */}
             <div className={cn(
                 "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity",
                 colored && isPositive && "bg-gradient-to-br from-accent/10 to-transparent",
                 colored && isNegative && "bg-gradient-to-br from-destructive/10 to-transparent",
                 !colored && "bg-gradient-to-br from-primary/5 to-transparent"
             )} />
            
            <span className="text-sm font-semibold text-muted-foreground z-10 uppercase tracking-wide">{label}</span>
            <span className={cn(
                "text-4xl font-bold tracking-tight z-10",
                colored && isPositive && "text-accent",
                colored && isNegative && "text-destructive",
                !colored && "text-foreground"
            )}>
                {value}
            </span>
        </div>
    )
}
