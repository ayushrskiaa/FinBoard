export async function fetchApiData(url: string) {
  // Inject API Key for Alpha Vantage if missing
  if (url.includes('alphavantage.co') && !url.includes('apikey=')) {
    const apiKey = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY;
    if (apiKey) {
      const separator = url.includes('?') ? '&' : '?';
      url = `${url}${separator}apikey=${apiKey}`;
    }
  }

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Status: ${res.status}`);
    const data = await res.json();
    return data;
  } catch (error) {
    console.warn("Direct fetch failed, attempting proxy...", error);
    try {
        // Fallback to proxy
        const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`;
        const res = await fetch(proxyUrl);
        if (!res.ok) {
             const errText = await res.text();
             throw new Error(`Proxy Status: ${res.status} - ${errText}`);
        }
        const data = await res.json();
        return data;
    } catch (proxyError) {
        console.error("API Proxy Fetch Error:", proxyError);
        throw proxyError;
    }
  }
}

export function flattenObjectKeys(obj: unknown, prefix = ''): string[] {
  if (typeof obj !== 'object' || obj === null) {
    return [prefix];
  }

  return Object.keys(obj).reduce((acc: string[], key) => {
    // Use '/' as separator to handle keys with dots (like "1. open")
    const pre = prefix.length ? `${prefix}/${key}` : key;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const val = (obj as any)[key];
    
    // Check if it's an array
    if (Array.isArray(val)) {
      const arrayPath = `${pre}[]`;
      const root = [arrayPath];
      
      if (val.length > 0 && typeof val[0] === 'object') {
         const itemPaths = flattenObjectKeys(val[0], arrayPath);
         return acc.concat(root, itemPaths);
      }
      return acc.concat(root);
    } 
    // Map-Like object check
    else if (typeof val === 'object' && val !== null) {
        const keys = Object.keys(val);
        const firstSubVal = val[keys[0]];
        
        if (keys.length > 0 && typeof firstSubVal === 'object' && firstSubVal !== null) {
             const arrayPath = `${pre}[]`;
             const root = [arrayPath];
             const keyField = `${arrayPath}/_key`;
             
             const itemPaths = flattenObjectKeys(firstSubVal, arrayPath);
             return acc.concat(root, [keyField], itemPaths);
        }

        return acc.concat(flattenObjectKeys(val, pre));
    }
    
    return acc.concat(pre);
  }, []);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getValueByPath(obj: any, path: string) {
  if(!obj) return undefined;
  
  // Handle generic array path
  if (path.includes('[]')) {
    const parts = path.split('[]');
    const arrayPath = parts[0];
    const innerPath = parts[1]?.startsWith('/') ? parts[1].slice(1) : parts[1]; // remove leading slash
    
    // Get the potential array or map
    const rawVal = getValueByPathSimple(obj, arrayPath);
    
    let array: any[] | undefined = undefined;

    if (Array.isArray(rawVal)) {
        array = rawVal;
    } else if (typeof rawVal === 'object' && rawVal !== null) {
        array = Object.entries(rawVal).map(([k, v]) => {
            if (typeof v === 'object' && v !== null) {
                return { _key: k, ...(v as object) };
            }
            return { _key: k, value: v };
        });
    }

    if (!array) return undefined;
    
    if (!innerPath) return array; 
    
    if (innerPath === '_key') {
        return array.map(item => item._key);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return array.map((item: any) => getValueByPathSimple(item, innerPath));
  }
  
  return getValueByPathSimple(obj, path);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getValueByPathSimple(obj: any, path: string) {
  if (!path) return obj;
  // Split by '/' to handle keys containing dots
  const keys = path.split('/');
  let current = obj;
  for (const key of keys) {
    if (current === undefined || current === null) return undefined;
    current = current[key];
  }
  return current;
}
