import type { FontVariant } from '@onefootprint/themes';

import type { LinkButtonSize } from './link-button.types';

export const fontSize: Record<LinkButtonSize, FontVariant> = {
  default: 'label-2',
  compact: 'label-3',
  tiny: 'label-4',
  xTiny: 'caption-1',
  xxTiny: 'caption-2',
};

export const sizes = ['default', 'compact', 'tiny', 'xTiny', 'xxTiny'];

export const variants = ['default', 'destructive'];
