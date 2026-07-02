export type TrackingParams = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    GB_TRACKING?: {
      captureUtm: () => Record<string, string>;
      getAttribution: () => Record<string, string>;
      trackEvent: (eventName: string, params?: TrackingParams) => void;
    };
  }
}

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;
const STORAGE_KEY = 'gb_attrib_v1';

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function readStoredAttribution(): Record<string, string> {
  if (!isBrowser()) return {};

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function captureUtm(): Record<string, string> {
  if (!isBrowser()) return {};

  const params = new URLSearchParams(window.location.search || '');
  const stored = readStoredAttribution();
  let changed = false;

  for (const key of UTM_KEYS) {
    const value = params.get(key);
    if (value) {
      stored[key] = value;
      window.localStorage.setItem(`gb_${key}`, value);
      changed = true;
    }
  }

  if (changed) {
    stored._ts = String(Date.now());
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  }

  return stored;
}

export function getAttribution(): Record<string, string> {
  if (!isBrowser()) return {};

  const stored = captureUtm();
  return UTM_KEYS.reduce<Record<string, string>>((result, key) => {
    result[key] = stored[key] || window.localStorage.getItem(`gb_${key}`) || '';
    return result;
  }, {});
}

export function trackEvent(eventName: string, params: TrackingParams = {}): void {
  if (!isBrowser() || !eventName) return;

  const attribution = getAttribution();
  const payload = {
    event: eventName,
    ...attribution,
    ...params
  };

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);

  if (process.env.NODE_ENV !== 'production') {
    console.log('Tracking event fired:', eventName, params);
  }
}
