import * as t from '../../../output/light';
import type { Label } from '../../types/components';

const label: Label = {
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

export default label;
