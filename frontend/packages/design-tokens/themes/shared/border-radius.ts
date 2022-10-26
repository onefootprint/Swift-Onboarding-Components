import type { BorderRadiuses } from '../types';
import * as globals from '../../output/global';

const borderRadius: BorderRadiuses = {
  none: 0,
  compact: globals.borderRadiusCompact,
  default: globals.borderRadiusDefault,
  large: globals.borderRadiusLarge,
  full: globals.borderRadiusFull,
};

export default borderRadius;
