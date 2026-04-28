const isBrowser = typeof window !== 'undefined' && typeof window.localStorage?.getItem === 'function';

export const storage = {
  get: (key: string): string | null => {
    try { return isBrowser ? localStorage.getItem(key) : null; } catch { return null; }
  },
  set: (key: string, value: string): void => {
    try { if (isBrowser) localStorage.setItem(key, value); } catch { /* noop */ }
  },
  remove: (key: string): void => {
    try { if (isBrowser) localStorage.removeItem(key); } catch { /* noop */ }
  },
};
