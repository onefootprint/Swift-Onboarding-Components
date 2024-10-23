const key = 'fp-session-id';
const isBrowser = typeof window !== 'undefined';
const isTest = process.env.NODE_ENV === 'test';
const queryParamKey = 'xfpsessionid';

// replaced the uuid lib with custom implementation as the package is not compatible with our UMD build of footprint-js
export const uuidv4 = () => {
  return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, c =>
    (+c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))).toString(16),
  );
};

const getParamValue = (param: string, url: string): string | null => {
  const urlObject = new URL(url);
  return urlObject.searchParams.get(param);
};

const getParamFromHost = (param: string) => {
  try {
    const currentUrl = window?.top?.location?.href;

    return currentUrl ? getParamValue(param, currentUrl) : null;
  } catch {
    return null;
  }
};

export const getSessionIdFromQueryParam = (): string | null => {
  if (!isBrowser) return null;

  return getParamValue(queryParamKey, window.location.href) || getParamFromHost(queryParamKey);
};

const isSessionStorageAvailable = (): boolean => {
  if (!isTest && (!isBrowser || !window.sessionStorage)) return false;

  try {
    const testKey = 'test';
    sessionStorage.setItem(testKey, testKey);
    sessionStorage.removeItem(testKey);
    return true;
  } catch (_e) {
    return false;
  }
};

const create = (): string => {
  const sessionId = getSessionIdFromQueryParam() || uuidv4();
  if (isSessionStorageAvailable()) {
    try {
      sessionStorage.setItem(key, sessionId);
    } catch (e) {
      console.error('Failed to create session id', e);
    }
  }
  return sessionId;
};

const get = () => {
  const querySessionId = getSessionIdFromQueryParam();

  if (querySessionId) return querySessionId;

  return isSessionStorageAvailable() ? sessionStorage.getItem(key) : null;
};

const getSessionId = () => get() || create();

export const addSessionIdToQueryParam = (url: string, sessionId: string = getSessionId()) => {
  const urlObject = new URL(url);
  urlObject.searchParams.set(queryParamKey, sessionId);
  return urlObject.toString();
};

export const getSessionIdFromStorage = (): string | null => {
  if (!isBrowser || !window.sessionStorage) return null;
  try {
    return sessionStorage.getItem(key) || null;
  } catch {
    return null;
  }
};

export default getSessionId;
