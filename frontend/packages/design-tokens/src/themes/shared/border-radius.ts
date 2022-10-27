import * as globals from '../../output/global';
import type { BorderRadiuses } from '../types';

const borderRadius: BorderRadiuses = {
  none: 0,
  compact: globals.borderRadiusCompact,
  default: globals.borderRadiusDefault,
  large: globals.borderRadiusLarge,
  full: globals.borderRadiusFull,
};

export default borderRadius;
