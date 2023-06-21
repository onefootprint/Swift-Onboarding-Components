import { useTheme } from '@onefootprint/styled';
import omit from 'lodash/omit';
import pick from 'lodash/pick';

import {
  customPropNativeMapper,
  customPropStyles,
  customPropThemeMapper,
} from './use-sx.constants';
import type { CustomStyleProps, SXStyleProps, SXStyles } from './use-sx.types';

const useSX = (sx: SXStyleProps = {}) => {
  const theme = useTheme();
  const nativeCSSProperties = omit(sx, customPropStyles);
  const customCSSProperties = pick(sx, customPropStyles);
  const finalCSSProperties: SXStyles = { ...nativeCSSProperties };
  Object.entries(customCSSProperties).forEach(([propName, propValue]) => {
    const propNameCasted = propName as keyof CustomStyleProps;
    const themePropName = customPropThemeMapper[propNameCasted];
    customPropNativeMapper[propNameCasted].forEach(nativeCSSProperty => {
      // @ts-ignore
      finalCSSProperties[nativeCSSProperty] = theme[themePropName][propValue];
    });
  });
  return finalCSSProperties;
};

export default useSX;
