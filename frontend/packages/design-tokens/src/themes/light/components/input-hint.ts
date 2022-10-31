import * as t from '../../../output/light';
import type { InputHint } from '../../types/components/input-hint';

const inputHint: InputHint = {
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

export default inputHint;
