import type { RadioSelect } from '../../types/components';

const radioSelect: RadioSelect = {
  bg: 'var(--fp-base-radio-select-bg)',
  borderRadius: 'var(--fp-base-radio-select-border-radius)',
  borderWidth: 'var(--fp-base-radio-select-border-width)',
  borderColor: 'var(--fp-base-radio-select-border-color)',
  color: 'var(--fp-base-radio-select-color)',
  hover: {
    bg: 'var(--fp-base-radio-select-hover-bg)',
    borderColor: 'var(--fp-base-radio-select-hover-border-color)',
  },
  selected: {
    bg: 'var(--fp-base-radio-select-selected-bg)',
    borderColor: 'var(--fp-base-radio-select-selected-border-color)',
  },
  components: {
    icon: {
      bg: 'var(--fp-base-radio-select-components-icon-bg)',
      hover: {
        bg: 'var(--fp-base-radio-select-components-icon-hover-bg)',
      },
      selected: {
        bg: 'var(--fp-base-radio-select-components-icon-selected-bg)',
      },
    },
  },
};

export default radioSelect;
