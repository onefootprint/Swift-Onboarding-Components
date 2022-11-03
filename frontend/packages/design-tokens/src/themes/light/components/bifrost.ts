import type { Bifrost } from '../../types/components';

// TODO: Import this from theme - right now we don't have it
const overlay: Bifrost = {
  fpButton: {
    height: 'var(--fp-fp-button-heigh)',
    borderRadius: 'var(--fp-fp-button-border-radius)',
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
  dialog: {
    bg: 'var(--fp-bifrost-dialog-body-bg-primary)',
    elevation: 'var(--fp-bifrost-dialog-elevation)',
    borderRadius: 'var(--fp-bifrost-dialog-border-radius)',
  },
};

export default overlay;
