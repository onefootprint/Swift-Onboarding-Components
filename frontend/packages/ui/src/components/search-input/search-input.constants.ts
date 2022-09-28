import type { Spacings } from '@onefootprint/themes';

import type { Size } from './search-input.types';

export const sizeToHeight: Record<Size, string> = {
  default: '40px',
  large: '48px',
  compact: '32px',
};

export const sizeToIconMargin: Record<Size, keyof Spacings> = {
  default: 5,
  large: 5,
  compact: 4,
};

export const sizeToInputPadding: Record<Size, keyof Spacings> = {
  default: 9,
  large: 9,
  compact: 8,
};
