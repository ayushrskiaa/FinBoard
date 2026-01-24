'use client';

import { useState, useEffect } from 'react';
import { X, Check, Search, AlertCircle, Loader2, Plus, ArrowRight } from 'lucide-react';
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
  const [fieldFormatting, setFieldFormatting] = useState<Record<string, 'default' | 'currency' | 'percent' | 'number'>>(initialWidget?.data.fieldFormatting || {});
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
     // If editing, valid data exists, but maybe we want to refresh fields just in case?
     // For now relying on cachedData is faster.
  }, [initialWidget]);

  const handleTestConnection = async () => {
    if (!url) return;
    setLoading(true);
    setError(null);
    setApiData(null);
    setAvailableFields([]); // Clear previous fields to prevent UI mismatch
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
      fieldFormatting,
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

  const filteredFields = availableFields.filter(f => 
    f.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Quick Presets</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { 
                    label: 'Bitcoin (Coinbase)', 
                    url: 'https://api.coinbase.com/v2/prices/BTC-USD/spot', 
                    icon: '🏦',
                  },
                  { 
                    label: 'Exchange Rates (Coinbase)', 
                    url: 'https://api.coinbase.com/v2/exchange-rates?currency=BTC', 
                    icon: '💱',
                  },
                  { label: 'Binance 24h Ticker (Plan C)', url: 'https://api.binance.com/api/v3/ticker/24hr', icon: '🔶' },
                  { label: 'Finnhub Quote', url: 'https://finnhub.io/api/v1/quote?symbol=AAPL', icon: '🍎' },
                  { label: 'Finnhub Profile', url: 'https://finnhub.io/api/v1/stock/profile2?symbol=AAPL', icon: '🏢' },
                  { label: 'Stock Fundamentals (Rich)', url: 'https://www.alphavantage.co/query?function=OVERVIEW&symbol=IBM', icon: '📑' },
                  { label: 'Stock Intraday (Chart)', url: 'https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=IBM&interval=5min', icon: '📈' },
                  { label: 'Crypto Market (Rich Data - May Block)', url: 'https://api.coincap.io/v2/assets?limit=20', icon: '💰' },
                  { label: 'Exchange Rates', url: 'https://api.coincap.io/v2/rates', icon: '💱' },
                  { label: 'AlphaVantage Quote (Simple)', url: 'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=IBM', icon: '💲' },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => { 
                        setUrl(preset.url); 
                        setTitle(preset.label);
                        
                        // Auto-configure optimal fields for complex presets
                        if (preset.label.includes('Exchange Rates')) {
                            // Automatically select the most useful fields for the user
                            const fields = ['data/currency', 'data/rates/USD', 'data/rates/INR', 'data/rates/EUR', 'data/rates/GBP'];
                            setSelectedFields(fields);
                            // Auto-format them
                            setFieldFormatting({
                                'data/rates/USD': 'number',
                                'data/rates/INR': 'number',
                                'data/rates/EUR': 'number',
                                'data/rates/GBP': 'number'
                            });
                            // Set to Table mode by default as it's best for this
                            setDisplayMode('table');
                        }
                    }}
                    className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-full border border-gray-700 transition-colors flex items-center gap-1.5"
                  >
                    <span>{preset.icon}</span>
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

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
               
               {/* API Key Helper */}
               {(url.includes('finnhub.io') || url.includes('alphavantage.co')) && (
                 <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-2 animate-in fade-in slide-in-from-top-2">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-blue-400">
                            {url.includes('finnhub.io') ? 'Enter Finnhub API Key' : 'Enter Alpha Vantage API Key'}
                        </label>
                        <input 
                            type="password" 
                            placeholder={url.includes('finnhub.io') ? "Paste token here..." : "Paste key here..."}
                            className="w-full bg-[#0b1221] border border-blue-500/30 rounded px-3 py-2 text-xs text-white outline-none focus:border-blue-400 placeholder:text-gray-600 font-mono"
                            onChange={(e) => {
                                const val = e.target.value.trim();
                                let newUrl = url;
                                const paramName = url.includes('finnhub.io') ? 'token' : 'apikey';
                                
                                if (!val) {
                                    // Remove param if empty
                                    if (newUrl.includes(`?${paramName}=`)) {
                                       newUrl = newUrl.replace(new RegExp(`\\?${paramName}=[^&]*`), '');
                                    } else {
                                       newUrl = newUrl.replace(new RegExp(`&${paramName}=[^&]*`), '');
                                    }
                                } else {
                                    // Update or append
                                    const regex = new RegExp(`([?&])${paramName}=[^&]*`);
                                    if (regex.test(newUrl)) {
                                        newUrl = newUrl.replace(regex, `$1${paramName}=${val}`);
                                    } else {
                                        const separator = newUrl.includes('?') ? '&' : '?';
                                        newUrl = `${newUrl}${separator}${paramName}=${val}`;
                                    }
                                }
                                setUrl(newUrl);
                            }}
                        />
                    </div>
                    <div className="text-[10px] text-gray-500 mt-2 space-y-1">
                        {url.includes('finnhub.io') ? (
                            <p>
                                Need a key? <a href="https://finnhub.io/register" target="_blank" className="text-blue-400 hover:underline">Register at finnhub.io</a> (Free)
                            </p>
                        ) : (
                            <div>
                                <p className="font-medium text-gray-400">How to get a free AlphaVantage Key:</p>
                                <ol className="list-decimal pl-4 space-y-0.5 text-gray-500">
                                    <li>Go to <a href="https://www.alphavantage.co/support/#api-key" target="_blank" className="text-blue-400 hover:underline">alphavantage.co/support</a></li>
                                    <li>Enter your email (no sign-up required)</li>
                                    <li>Copy the key displayed on screen</li>
                                </ol>
                            </div>
                        )}
                    </div>
                 </div>
               )}

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
                 <div className="text-red-400 text-xs flex items-center gap-2 mt-2 bg-red-400/10 p-3 rounded-lg border border-red-400/20 break-all">
                   <AlertCircle className="h-4 w-4 shrink-0" />
                   <span>{error}</span>
                 </div>
               )}

                   {apiData && availableFields.length === 1 && (['Information', 'Note', 'Error Message'].includes(availableFields[0])) ? (
                        <div className="text-yellow-400 text-xs flex flex-col gap-2 mt-2 bg-yellow-400/10 p-3 rounded-lg border border-yellow-400/20 break-all">
                           <div className="flex items-center gap-2">
                               <AlertCircle className="h-4 w-4 shrink-0" />
                               <span>API Limit Reached on AlphaVantage.</span>
                           </div>
                           <div className="pl-6 text-[10px] opacity-80">
                               {JSON.stringify(apiData[availableFields[0]])}
                           </div>
                           
                           {/* Smart Recovery Action */}
                           <button 
                                onClick={() => {
                                    // Try to extract symbol from current URL
                                    const match = url.match(/symbol=([^&]*)/);
                                    const symbol = match ? match[1] : 'IBM';
                                    
                                    // Try to extract existing key (user might have used Finnhub key on AV accidentally)
                                    const keyMatch = url.match(/apikey=([^&]*)/);
                                    const existingKey = keyMatch ? keyMatch[1] : '';
                                    
                                    let newUrl = `https://finnhub.io/api/v1/quote?symbol=${symbol}`;
                                    if (existingKey) {
                                        newUrl += `&token=${existingKey}`;
                                    }
                                    
                                    setUrl(newUrl);
                                    setTitle(`Stock Quote (${symbol})`);
                                    setError(null); // Clear previous error
                                    setApiData(null); // Clear previous data
                                }}
                                className="mt-1 bg-yellow-400/20 hover:bg-yellow-400/30 text-yellow-200 text-xs px-3 py-1.5 rounded-md transition-colors text-left w-full flex items-center justify-between"
                           >
                               <span>Switch to Finnhub (Free Alternative)</span>
                               <ArrowRight className="h-3 w-3" />
                           </button>
                        </div>
                   ) : (
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
                          {mode === 'price-card' && "Card"}
                          {mode === 'table' && "Table"}
                          {mode === 'chart' && "Chart"}
                        </button>
                      ))}
                    </div>
                    {displayMode === 'chart' && !selectedFields.some(f => f.includes('[]')) && (
                        <div className="flex items-center gap-2 mt-2 text-xs text-yellow-400 bg-yellow-400/10 p-2 rounded border border-yellow-400/20">
                           <AlertCircle className="h-3 w-3" />
                           Charts require array data (Time Series). Current selection may not render.
                        </div>
                    )}
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
                         value={searchQuery}
                         onChange={(e) => setSearchQuery(e.target.value)}
                         className="w-full pl-9 bg-[#0b1221] border border-gray-700 rounded-md px-3 py-2 text-sm focus:border-green-500 outline-none text-white placeholder:text-gray-600"
                       />
                     </div>
                   </div>
                   <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                     {filteredFields.map((field) => (
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
                     {filteredFields.length === 0 && (
                       <div className="p-4 text-center text-xs text-gray-500">
                         No fields found matching "{searchQuery}"
                       </div>
                     )}
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

                 {/* Field Formatting Configuration */}
                 {selectedFields.length > 0 && (
                     <div className="space-y-3 mt-4 pt-4 border-t border-gray-800 animate-in slide-in-from-bottom-2 duration-300">
                        <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Field Formatting</label>
                        <div className="grid grid-cols-1 gap-3 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                           {selectedFields.map(field => (
                               <div key={field} className="flex items-center justify-between gap-4 bg-[#131b2e] p-2.5 rounded-lg border border-gray-800">
                                   <div className="flex flex-col overflow-hidden">
                                      <span className="truncate font-medium text-sm text-gray-200">{field.split(/[/.]/).pop()}</span>
                                      <span className="truncate font-mono text-[10px] text-gray-500">{field}</span>
                                   </div>
                                   <select
                                     value={fieldFormatting[field] || 'default'}
                                     onChange={(e) => setFieldFormatting(prev => ({ ...prev, [field]: e.target.value as any }))}
                                     className="bg-[#0b1221] border border-gray-700 rounded px-2 py-1 text-xs text-gray-300 outline-none focus:border-green-500 min-w-[100px]"
                                   >
                                       <option value="default">Default</option>
                                       <option value="currency">Currency ($)</option>
                                       <option value="percent">Percentage (%)</option>
                                       <option value="number">Number (1.23)</option>
                                   </select>
                               </div>
                           ))}
                        </div>
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
