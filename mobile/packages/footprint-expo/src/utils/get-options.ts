import type { FootprintOptions } from '../footprint.types';
import encode from './encode';

const getOptions = (options: FootprintOptions = {}) => {
  return encode(options);
};

export default getOptions;
