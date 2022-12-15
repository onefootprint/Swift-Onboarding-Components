import { v4 as uuidv4 } from 'uuid';

const key = 'fp-session-id';

const create = () => {
  const sessionId = uuidv4();
  sessionStorage?.setItem(key, sessionId);
  return sessionId;
};

const get = () => sessionStorage?.getItem(key);

const getSessionId = () => get() || create();

export default getSessionId;
