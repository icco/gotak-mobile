import { logDebug, logError, logWarning } from '../utils/logger';

const DEFAULT_BASE_URL = 'https://gotak.app';

function resolveBaseUrl(): string {
  const raw = process.env.EXPO_PUBLIC_API_URL;
  if (!raw) {
    return DEFAULT_BASE_URL;
  }

  const trimmed = raw.trim();
  if (!trimmed) {
    return DEFAULT_BASE_URL;
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    logError('EXPO_PUBLIC_API_URL is not a valid URL, falling back to default', {
      provided: trimmed,
      fallback: DEFAULT_BASE_URL,
    });
    return DEFAULT_BASE_URL;
  }

  const isLocal =
    parsed.hostname === 'localhost' ||
    parsed.hostname === '127.0.0.1' ||
    parsed.hostname === '0.0.0.0' ||
    parsed.hostname.endsWith('.local');

  if (parsed.protocol === 'http:' && !isLocal) {
    if (__DEV__) {
      logWarning('EXPO_PUBLIC_API_URL uses plaintext http:// for a non-local host; upgrading to https://', {
        provided: trimmed,
      });
    } else {
      logError('Refusing plaintext http:// API URL in production build, upgrading to https://', {
        provided: trimmed,
      });
    }
    // Avoid mutating parsed.protocol (read-only in some TS libs) and rebuild instead.
    const upgraded = `https://${trimmed.slice('http://'.length)}`;
    return upgraded.replace(/\/$/, '');
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    logError('EXPO_PUBLIC_API_URL has unsupported protocol, falling back to default', {
      provided: trimmed,
      protocol: parsed.protocol,
    });
    return DEFAULT_BASE_URL;
  }

  return trimmed.replace(/\/$/, '');
}

export const API_CONFIG = {
  BASE_URL: resolveBaseUrl(),

  // Timeout for requests (in milliseconds)
  TIMEOUT: 10000,

  DEBUG: __DEV__,
};

if (API_CONFIG.DEBUG) {
  logDebug('API configuration loaded', { baseUrl: API_CONFIG.BASE_URL, timeout: API_CONFIG.TIMEOUT });
}
