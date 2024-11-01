import omit from 'lodash/omit';
import pick from 'lodash/pick';
import { useTheme } from 'styled-components';

import { customPropNativeMapper, customPropStyles, customPropThemeMapper } from './use-sx.constants';
import type { CustomStyleProps, SXStyleProps, SXStyles } from './use-sx.types';

/** @deprecated: only used in test files */
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
