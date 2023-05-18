import * as t from '../../../output/light';
import type { Hint } from '../../types/components';

const hint: Hint = {
  states: {
    default: {
      color: t.baseInputsBaseHint,
    },
    error: {
      color: t.baseInputsBaseHintError,
    },
  },
  size: {
    default: {
      typography: t.baseInputsTypographyDefaultHint,
    },
    compact: {
      typography: t.baseInputsTypographyCompactHint,
    },
  },
};

export default hint;
