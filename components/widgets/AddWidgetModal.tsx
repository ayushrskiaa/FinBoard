'use client';

import { useState } from 'react';
import { X, Check, Search, AlertCircle, Loader2 } from 'lucide-react';
import { fetchApiData, flattenObjectKeys } from '@/lib/api-helper';
import { useDashboardStore, WidgetType } from '@/store/useDashboardStore';
import { cn } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';

interface AddWidgetModalProps {
  onClose: () => void;
}

export function AddWidgetModal({ onClose }: AddWidgetModalProps) {
  const addWidget = useDashboardStore((s) => s.addWidget);

  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Connection State
  const [url, setUrl] = useState('');
  const [apiData, setApiData] = useState<any>(null);
  const [availableFields, setAvailableFields] = useState<string[]>([]);
  
  // Configuration State
  const [title, setTitle] = useState('');
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [displayMode, setDisplayMode] = useState<WidgetType>('price-card');

  const handleTestConnection = async () => {
    if (!url) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchApiData(url);
      setApiData(data);
      const fields = flattenObjectKeys(data);
      setAvailableFields(fields);
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    const newWidget = {
      id: uuidv4(),
      data: {
        title: title || 'New Widget',
        apiEndpoint: url,
        refreshInterval,
        selectedFields,
        displayMode,
        cachedData: apiData,
        lastUpdated: Date.now(),
      },
      layout: { w: 1, h: 1, x: 0, y: 0 } // Layout is handled by grid flow, these are just defaults
    };
    addWidget(newWidget);
    onClose();
  };

  const toggleField = (field: string) => {
    if (selectedFields.includes(field)) {
      setSelectedFields(selectedFields.filter(f => f !== field));
    } else {
      if (displayMode === 'price-card' && selectedFields.length >= 2) return; // Limit for simple card
      setSelectedFields([...selectedFields, field]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-3xl rounded-xl border border-border shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-border flex justify-between items-center bg-muted/20 rounded-t-xl">
          <div>
            <h2 className="text-xl font-bold">Add New Widget</h2>
            <p className="text-sm text-muted-foreground">Connect to APIs and build your custom dashboard</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Widget Name</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Bitcoin Price" 
                className="w-full bg-background border border-border rounded-md px-3 py-2 focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            <div className="space-y-2">
               <label className="text-sm font-medium">API URL</label>
               <div className="flex gap-2">
                 <input 
                   type="text" 
                   value={url}
                   onChange={(e) => setUrl(e.target.value)}
                   placeholder="https://api.example.com/data" 
                   className="flex-1 bg-background border border-border rounded-md px-3 py-2 focus:ring-2 focus:ring-primary outline-none font-mono text-sm"
                 />
                 <button 
                   onClick={handleTestConnection}
                   disabled={loading || !url}
                   className="px-4 bg-secondary text-secondary-foreground rounded-md font-medium hover:bg-secondary/80 disabled:opacity-50 min-w-[100px] flex items-center justify-center"
                 >
                   {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Test'}
                 </button>
               </div>
               
               {error && (
                 <div className="text-destructive text-sm flex items-center gap-2 mt-2">
                   <AlertCircle className="h-4 w-4" />
                   {error}
                 </div>
               )}

               {apiData && !error && (
                 <div className="text-green-500 text-sm flex items-center gap-2 mt-2 bg-green-500/10 p-2 rounded border border-green-500/20">
                   <Check className="h-4 w-4" />
                   Connection successful! Found {availableFields.length} fields.
                 </div>
               )}
            </div>

             <div className="space-y-2">
              <label className="text-sm font-medium">Refresh Interval (seconds)</label>
              <input 
                type="number" 
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                min={5}
                className="w-full bg-background border border-border rounded-md px-3 py-2 bg-muted/50"
              />
            </div>
          </div>

          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-bottom-5 fade-in duration-300">
               <hr className="border-border" />
               
               <div className="grid grid-cols-2 gap-6">
                 <div>
                    <label className="text-sm font-medium mb-2 block">Display Mode</label>
                    <div className="flex rounded-md bg-muted p-1">
                      {(['price-card', 'table', 'chart'] as const).map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setDisplayMode(mode)}
                          className={cn(
                            "flex-1 py-1.5 text-sm font-medium rounded capitalize transition-all",
                            displayMode === mode ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {mode.replace('-', ' ')}
                        </button>
                      ))}
                    </div>
                 </div>
               </div>

               <div>
                 <div className="flex justify-between items-center mb-2">
                   <label className="text-sm font-medium">Select Fields to Display</label>
                   <span className="text-xs text-muted-foreground">{selectedFields.length} selected</span>
                 </div>
                 
                 <div className="border border-border rounded-lg overflow-hidden h-[200px] flex flex-col">
                   <div className="p-2 border-b border-border bg-muted/30">
                     <div className="relative">
                       <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                       <input 
                         type="text" 
                         placeholder="Search fields..." 
                         className="w-full pl-9 bg-background border border-border rounded-md px-3 py-1.5 text-sm"
                       />
                     </div>
                   </div>
                   <div className="flex-1 overflow-y-auto p-2 space-y-1">
                     {availableFields.map((field) => (
                       <button
                         key={field}
                         onClick={() => toggleField(field)}
                         className={cn(
                           "flex items-center justify-between w-full px-3 py-2 rounded-md text-sm text-left transition-colors",
                           selectedFields.includes(field) ? "bg-primary/10 text-primary border border-primary/20" : "hover:bg-muted"
                         )}
                       >
                         <span className="truncate">{field}</span>
                         {selectedFields.includes(field) && <Check className="h-4 w-4" />}
                       </button>
                     ))}
                   </div>
                 </div>
                 <p className="text-xs text-muted-foreground mt-2">
                   {displayMode === 'price-card' && "For Cards, select a Label field and a Value field (Max 2)."}
                   {displayMode === 'chart' && "For Charts, select an Axis field and a Value field."}
                 </p>
               </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex justify-end gap-3 bg-muted/20 rounded-b-xl">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm font-medium hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button 
            disabled={step === 1 || selectedFields.length === 0}
            onClick={handleSave}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Widget
          </button>
        </div>

      </div>
    </div>
  );
}
