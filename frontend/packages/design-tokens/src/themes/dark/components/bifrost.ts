import { borderRadius } from '../../../primitives/borders';
import { spacing } from '../../../primitives/spacing';
import {
  elevation,
  overlay,
  surfaceColor,
  textColor,
} from '../../../tokens/dark';
import type { Bifrost } from '../../types/components';

export const fpButtonHeight = '48px';

// TODO: Import this from theme - right now we don't have it
const bifrost: Bifrost = {
  fpButton: {
    height: fpButtonHeight,
    borderRadius: borderRadius.default,
  },
  overlay: {
    bg: overlay.default,
  },
  loading: {
    bg: 'rgba(0, 0, 0, 0.6)',
    borderRadius: borderRadius.compact,
    color: textColor.primary,
    padding: spacing[5],
  },
  dialog: {
    bg: surfaceColor[3],
    elevation: elevation[3],
    borderRadius: borderRadius.default,
  },
};

export default bifrost;
