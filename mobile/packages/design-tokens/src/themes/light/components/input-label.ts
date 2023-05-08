import * as t from '../../../output/light';
import type { InputLabel } from '../../types/components';

const inputLabel: InputLabel = {
  states: {
    default: {
      color: t.baseInputsInitialLabel,
    },
    error: {
      color: t.baseInputsInitialErrorLabel,
    },
  },
  size: {
    default: {
      typography: t.baseInputsTypographyDefaultLabel,
    },
    compact: {
      typography: t.baseInputsTypographyCompactLabel,
    },
  },
};

export default inputLabel;
