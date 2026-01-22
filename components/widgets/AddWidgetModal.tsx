'use client';

import { useState, useEffect } from 'react';
import { X, Check, Search, AlertCircle, Loader2, Plus } from 'lucide-react';
import { fetchApiData, flattenObjectKeys } from '@/lib/api-helper';
import { useDashboardStore, WidgetType, Widget } from '@/store/useDashboardStore';
import { cn } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';

interface AddWidgetModalProps {
  onClose: () => void;
  initialWidget?: Widget;
}

export function AddWidgetModal({ onClose, initialWidget }: AddWidgetModalProps) {
  const { addWidget, updateWidget } = useDashboardStore();

  const [step, setStep] = useState<1 | 2>(initialWidget ? 2 : 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Connection State
  const [url, setUrl] = useState(initialWidget?.data.apiEndpoint || '');
  const [apiData, setApiData] = useState<any>(initialWidget?.data.cachedData || null);
  const [availableFields, setAvailableFields] = useState<string[]>(
    initialWidget?.data.cachedData ? flattenObjectKeys(initialWidget.data.cachedData) : []
  );
  
  // Configuration State
  const [title, setTitle] = useState(initialWidget?.data.title || '');
  const [refreshInterval, setRefreshInterval] = useState(initialWidget?.data.refreshInterval || 30);
  const [selectedFields, setSelectedFields] = useState<string[]>(initialWidget?.data.selectedFields || []);
  const [displayMode, setDisplayMode] = useState<WidgetType>(initialWidget?.data.displayMode || 'price-card');

  useEffect(() => {
     // If editing, valid data exists, but maybe we want to refresh fields just in case?
     // For now relying on cachedData is faster.
  }, [initialWidget]);

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
    const widgetData: any = { // Partial<Widget> logic
      title: title || 'New Widget',
      apiEndpoint: url,
      refreshInterval,
      selectedFields,
      displayMode,
      cachedData: apiData,
      lastUpdated: Date.now(),
    };

    if (initialWidget) {
       updateWidget(initialWidget.id, { data: widgetData });
    } else {
       const newWidget = {
        id: uuidv4(),
        data: widgetData,
        layout: { w: 1, h: 1, x: 0, y: 0 } 
       };
       addWidget(newWidget);
    }
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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#0b1221] w-full max-w-2xl rounded-xl border border-gray-800 shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">Add New Widget</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Widget Name</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Bitcoin Price Tracker" 
                className="w-full bg-[#131b2e] border border-gray-700 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none placeholder:text-gray-600 text-white transition-all"
              />
            </div>

            <div className="space-y-2">
               <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">API URL</label>
               <div className="flex gap-3">
                 <input 
                   type="text" 
                   value={url}
                   onChange={(e) => setUrl(e.target.value)}
                   placeholder="e.g., https://api.coinbase.com/v2/prices/BTC-USD/spot" 
                   className="flex-1 bg-[#131b2e] border border-gray-700 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none font-mono text-gray-300 transition-all placeholder:text-gray-600"
                 />
                 <button 
                   onClick={handleTestConnection}
                   disabled={loading || !url}
                   className="px-6 bg-[#131b2e] border border-gray-700 text-white rounded-lg font-medium hover:bg-gray-800 hover:border-gray-600 disabled:opacity-50 min-w-[100px] flex items-center justify-center transition-all"
                 >
                   {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Test'}
                 </button>
               </div>
               
               {error && (
                 <div className="text-red-400 text-xs flex items-center gap-2 mt-2 bg-red-400/10 p-3 rounded-lg border border-red-400/20">
                   <AlertCircle className="h-4 w-4" />
                   {error}
                 </div>
               )}

               {apiData && !error && (
                 <div className="text-green-400 text-xs flex items-center gap-2 mt-2 bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                   <div className="bg-green-500/20 p-1 rounded-full">
                      <Check className="h-3 w-3" />
                   </div>
                   API connection successful! {availableFields.length} fields found.
                 </div>
               )}
            </div>

             <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Refresh Interval (seconds)</label>
              <input 
                type="number" 
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                min={5}
                className="w-full bg-[#131b2e] border border-gray-700 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none text-white transition-all"
              />
            </div>
          </div>

          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-bottom-5 fade-in duration-300 pt-2">
               
               <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Display Mode</label>
                    <div className="flex gap-2">
                      {(['price-card', 'table', 'chart'] as const).map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setDisplayMode(mode)}
                          className={cn(
                            "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-all",
                            displayMode === mode 
                                ? "bg-green-600 border-green-500 text-white shadow-lg shadow-green-900/20" 
                                : "bg-[#131b2e] border-gray-700 text-gray-400 hover:text-white hover:border-gray-600"
                          )}
                        >
                          {/* We could add icons here if needed */}
                          {mode === 'price-card' && "Card"}
                          {mode === 'table' && "Table"}
                          {mode === 'chart' && "Chart"}
                        </button>
                      ))}
                    </div>
               </div>

               <div className="space-y-2">
                 <div className="flex justify-between items-center">
                   <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Available Fields</label>
                 </div>
                 
                 <div className="bg-[#131b2e] border border-gray-700 rounded-lg overflow-hidden flex flex-col h-[240px]">
                   <div className="p-3 border-b border-gray-700">
                     <div className="relative">
                       <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                       <input 
                         type="text" 
                         placeholder="Search for fields..." 
                         className="w-full pl-9 bg-[#0b1221] border border-gray-700 rounded-md px-3 py-2 text-sm focus:border-green-500 outline-none text-white placeholder:text-gray-600"
                       />
                     </div>
                   </div>
                   <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                     {availableFields.map((field) => (
                       <button
                         key={field}
                         onClick={() => toggleField(field)}
                         className={cn(
                           "flex items-center justify-between w-full px-3 py-2.5 rounded-md text-sm text-left transition-colors group",
                           selectedFields.includes(field) ? "bg-green-600/10 border border-green-600/30 text-green-400" : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                         )}
                       >
                         <div className="flex flex-col overflow-hidden">
                            <span className="truncate font-mono text-xs opacity-70">{field.split('/').slice(0, -1).join('/')}</span>
                            <span className="truncate font-medium">{field.split('/').pop()}</span>
                         </div>
                         {selectedFields.includes(field) ? (
                            <Check className="h-4 w-4 text-green-500 shrink-0 ml-2" />
                         ) : (
                            <Plus className="h-4 w-4 opacity-0 group-hover:opacity-100 shrink-0 ml-2" />
                         )}
                       </button>
                     ))}
                   </div>
                 </div>
                 
                 {/* Selected Fields Tags */}
                 {selectedFields.length > 0 && (
                     <div className="flex flex-wrap gap-2 mt-3 p-3 bg-[#131b2e] rounded-lg border border-gray-800">
                        {selectedFields.map(field => (
                            <div key={field} className="flex items-center gap-1 bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded border border-gray-700">
                                <span className="truncate max-w-[150px]">{field}</span>
                                <button onClick={() => toggleField(field)} className="hover:text-white"><X className="h-3 w-3" /></button>
                            </div>
                        ))}
                     </div>
                 )}
               </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-800 flex justify-end gap-3 rounded-b-xl bg-[#0b1221]">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button 
            disabled={step === 1 || selectedFields.length === 0}
            onClick={handleSave}
            className="px-6 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-500 transition-all shadow-lg shadow-green-900/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            Add Widget
          </button>
        </div>

      </div>
    </div>
  );
}
