import { useEffect, useState, useRef } from 'react';
import { Widget, useDashboardStore } from '@/store/useDashboardStore';
import { fetchApiData } from '@/lib/api-helper';

export function useWidgetData(widget: Widget) {
  const updateWidgetData = useDashboardStore((s) => s.updateWidgetData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(widget?.data?.cachedData || null);

  useEffect(() => {
    let isActive = true;

    const fetchData = async () => {
      if (isActive) {
          setLoading(true);
          setError(null);
      }
      
      try {
        const newData = await fetchApiData(widget?.data?.apiEndpoint || '');
        if (isActive) {
          setData(newData);
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

    const timeSinceLastUpdate = Date.now() - (widget?.data?.lastUpdated || 0);
    if (!widget?.data?.cachedData || timeSinceLastUpdate > (widget?.data?.refreshInterval || 30) * 1000) {
        fetchData();
    }

    const intervalId = setInterval(fetchData, (widget?.data?.refreshInterval || 30) * 1000);

    return () => {
      isActive = false;
      clearInterval(intervalId);
    };
  }, [widget.id, widget?.data?.apiEndpoint, widget?.data?.refreshInterval, updateWidgetData]);

  return { data, loading, error };
}
