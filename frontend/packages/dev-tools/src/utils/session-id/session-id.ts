import { v4 as uuidv4 } from 'uuid';

const key = 'fp-session-id';
const isBrowser = typeof window !== 'undefined';
const isTest = process.env.NODE_ENV === 'test';
const queryParamKey = 'xfpsessionid';

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

const getParamFromQuery = (param: string): string | null => {
  if (!isBrowser) return null;

  return getParamValue(param, window.location.href) || getParamFromHost(param);
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
  const sessionId = getParamFromQuery(queryParamKey) || uuidv4();
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
  const querySessionId = getParamFromQuery(queryParamKey);

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
