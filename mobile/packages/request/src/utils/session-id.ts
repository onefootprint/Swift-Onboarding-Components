import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

const key = 'fp-session-id';

const create = async () => {
  const sessionId = uuidv4();
  AsyncStorage.setItem(key, sessionId);
  return sessionId;
};

const get = async () => {
  try {
    const sessionId = await AsyncStorage.getItem(key);
    return sessionId;
  } catch (_) {
    // do nothing
    return null;
  }
};

const getSessionId = async () => {
  const existingSessionId = await get();
  return existingSessionId || (await create());
};

export default getSessionId;
