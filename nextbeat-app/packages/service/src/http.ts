const FETCH_MS = 8_000;

export async function fetchJson<T>(url: string, init: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_MS);
  try {
    const res = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        accept: 'application/json',
        ...(init.headers ?? {}),
      },
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status} ${url} ${body.slice(0, 180)}`);
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}
