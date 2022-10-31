import * as t from '../../../output/light';
import type { InputLabel } from '../../types/components/input-label';

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
      typography: t.baseInputsTypographyDefaultInputContent,
    },
    compact: {
      typography: t.baseInputsTypographyCompactInputContent,
    },
  },
};

export default inputLabel;
