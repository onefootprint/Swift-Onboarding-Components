import * as t from '../../../output/light';
import type { Bifrost } from '../../types/components';

// TODO: Import this from theme - right now we don't have it
const overlay: Bifrost = {
  fpButton: {
    height: `${t.fpButtonHeight}px`,
    borderRadius: `${t.fpButtonBorderRadius}px`,
  },
  overlay: {
    bg: 'rgba(0, 0, 0, 0.3)',
  },
  loading: {
    bg: 'rgba(0, 0, 0, 0.6)',
    borderRadius: '4px',
    color: '#FFFFFFF',
    padding: '16px',
  },
};

export default overlay;
