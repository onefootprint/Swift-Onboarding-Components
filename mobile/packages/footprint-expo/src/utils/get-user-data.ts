import type { FootprintUserData } from '../footprint.types';
import encode from './encode';

const getUserData = (userData: FootprintUserData = {}) => {
  return encode(userData);
};

export default getUserData;
