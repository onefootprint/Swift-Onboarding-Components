import omit from 'lodash/omit';
import pick from 'lodash/pick';
import { useTheme } from 'styled';

import {
  customPropNativeMapper,
  customPropStyles,
  customPropThemeMapper,
} from './use-xs.constants';
import type { CustomStyleProps, XSStyleProps, XSStyles } from './use-xs.types';

const useXS = (xs: XSStyleProps = {}) => {
  const theme = useTheme();
  const nativeCSSProperties = omit(xs, customPropStyles);
  const customCSSProperties = pick(xs, customPropStyles);
  const finalCSSProperties: XSStyles = { ...nativeCSSProperties };
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

export default useXS;
