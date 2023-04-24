import * as t from '../../output/light';
import type { BorderRadiuses } from '../types/types';

const borderRadius: BorderRadiuses = {
  none: '0px',
  compact: `${t.borderRadiusCompact}px`,
  default: `${t.borderRadiusDefault}px`,
  large: `${t.borderRadiusLarge}px`,
  full: `${t.borderRadiusFull}px`,
};

export default borderRadius;
