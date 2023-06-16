import type { FootprintAppearance } from '../footprint.types';
import encode from './encode';

const getAppearance = ({
  fontSrc,
  variables = {},
  rules = {},
}: FootprintAppearance = {}) => {
  return {
    fontSrc,
    variables: encode(variables),
    rules: encode(rules),
  };
};

export default getAppearance;
