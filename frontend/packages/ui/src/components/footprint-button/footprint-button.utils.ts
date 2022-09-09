import type { FontVariant } from 'themes';

import { FootprintButtonSize } from './footprint-button.types';

const footprintButtonFontVariantBySize: Record<
  FootprintButtonSize,
  FontVariant
> = {
  compact: 'label-2',
  default: 'label-1',
};

export default footprintButtonFontVariantBySize;
