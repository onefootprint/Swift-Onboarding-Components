import { borderRadius } from '../../../primitives/borders';
import { spacing } from '../../../primitives/spacing';
import {
  borderColor,
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
  container: {
    bg: surfaceColor[3],
    border: `1px solid ${borderColor.tertiary}`,
    borderRadius: borderRadius.default,
    elevation: elevation[3],
  },
};

export default bifrost;
