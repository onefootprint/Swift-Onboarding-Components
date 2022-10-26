import type { FontVariant } from '@onefootprint/design-tokens';

import { FootprintButtonSize } from './footprint-button.types';

const footprintButtonFontVariantBySize: Record<
  FootprintButtonSize,
  FontVariant
> = {
  compact: 'label-2',
  default: 'label-1',
};

export default footprintButtonFontVariantBySize;
