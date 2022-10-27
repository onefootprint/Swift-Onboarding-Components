import * as t from '../../output/light';
import type { BorderRadiuses } from '../types';

const borderRadius: BorderRadiuses = {
  none: 0,
  compact: t.borderRadiusCompact,
  default: t.borderRadiusDefault,
  large: t.borderRadiusLarge,
  full: t.borderRadiusFull,
};

export default borderRadius;
