import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  try {
    const response = await fetch(targetUrl, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'application/json',
            'Accept-Encoding': 'identity', // Prevent compression issues
        }
    });

    if (!response.ok) {
        // Allow the client to see the upstream error
        const text = await response.text();
        return NextResponse.json({ error: `Upstream error: ${response.status}`, details: text }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cause = (error as any).cause;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const msg = (error as any).message || String(error);
    
    console.error('Proxy Fetch Error:', msg, 'Cause:', cause);
    
    return NextResponse.json({ 
        error: 'Failed to fetch upstream', 
        details: msg,
        cause: cause ? String(cause) : undefined 
    }, { status: 500 });
  }
}
