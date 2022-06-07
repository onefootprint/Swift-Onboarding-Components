import type { FontVariant } from 'themes';

import type { LinkButtonSize } from './link-button.types';

const fontSize: Record<LinkButtonSize, FontVariant> = {
  default: 'label-2',
  compact: 'label-3',
  tiny: 'label-4',
  xTiny: 'caption-1',
  xxTiny: 'caption-2',
};

export default fontSize;
