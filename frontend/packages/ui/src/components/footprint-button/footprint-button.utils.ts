import type { FontVariant } from '@onefootprint/design-tokens';

import type { FootprintButtonSize } from './footprint-button.types';

const footprintButtonFontVariantBySize: Record<FootprintButtonSize, FontVariant> = {
  compact: 'label-2',
  default: 'label-1',
  large: 'label-1',
};

export default footprintButtonFontVariantBySize;
