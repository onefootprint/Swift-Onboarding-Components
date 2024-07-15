import * as t from '../../../output/light';
import type { RadioSelect } from '../../types/components';

const radioSelect: RadioSelect = {
  bg: t.radioSelectBg,
  borderRadius: t.radioSelectBorderRadius,
  borderWidth: t.radioSelectBorderWidth,
  borderColor: t.radioSelectBorderColor,
  color: t.radioSelectColor,
  hover: {
    color: t.radioSelectHoverColor,
    bg: t.radioSelectHoverBg,
    borderColor: t.radioSelectHoverBorderColor,
  },
  selected: {
    color: t.radioSelectSelectedColor,
    bg: t.radioSelectSelectedBg,
    borderColor: t.radioSelectSelectedBorderColor,
  },
  components: {
    icon: {
      bg: t.radioSelectComponentsIconBg,
      hover: {
        bg: t.radioSelectComponentsIconHoverBg,
      },
      selected: {
        bg: t.radioSelectComponentsIconSelectedBg,
      },
    },
  },
};

export default radioSelect;
