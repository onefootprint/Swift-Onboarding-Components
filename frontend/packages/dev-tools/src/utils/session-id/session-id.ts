import { v4 as uuidv4 } from 'uuid';

const key = 'fp-session-id';

const isSessionStorageAvailable = () => {
  try {
    const testKey = 'test';
    sessionStorage.setItem(testKey, testKey);
    sessionStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};

const create = () => {
  const sessionId = uuidv4();
  if (isSessionStorageAvailable()) {
    sessionStorage.setItem(key, sessionId);
  }
  return sessionId;
};

const get = () =>
  isSessionStorageAvailable() ? sessionStorage.getItem(key) : null;

const getSessionId = () => get() || create();

export default getSessionId;
