import { useEffect, useState, useRef } from 'react';
import { Widget, useDashboardStore } from '@/store/useDashboardStore';
import { fetchApiData } from '@/lib/api-helper';

export function useWidgetData(widget: Widget) {
  const updateWidgetData = useDashboardStore((s) => s.updateWidgetData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use cached data initially
  const [data, setData] = useState<any>(widget.data.cachedData || null);

  useEffect(() => {
    let isActive = true;

    const fetchData = async () => {
      // Only set loading if we don't have data, or if we want to show a background refresh indicator
      // For now, we'll just set it. 
      if (isActive) {
          setLoading(true);
          setError(null);
      }
      
      try {
        const newData = await fetchApiData(widget.data.apiEndpoint);
        if (isActive) {
          setData(newData);
          // Update store for persistence
          // Note: This might trigger a re-render of the parent, but since we rely on local 'data' state for display,
          // and the effect dependencies won't change, it should be stable.
          updateWidgetData(widget.id, { 
            cachedData: newData, 
            lastUpdated: Date.now() 
          });
        }
      } catch (err) {
        if (isActive) {
           setError(err instanceof Error ? err.message : 'Fetch error');
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    // Initial fetch check
    const timeSinceLastUpdate = Date.now() - (widget.data.lastUpdated || 0);
    // Fetch if no data or if stale (older than refresh interval)
    if (!widget.data.cachedData || timeSinceLastUpdate > widget.data.refreshInterval * 1000) {
        fetchData();
    }

    const intervalId = setInterval(fetchData, widget.data.refreshInterval * 1000);

    return () => {
      isActive = false;
      clearInterval(intervalId);
    };
  }, [widget.id, widget.data.apiEndpoint, widget.data.refreshInterval, updateWidgetData]); // Removed widget.data.lastUpdated/cachedData from deps to avoid loops

  return { data, loading, error };
}
