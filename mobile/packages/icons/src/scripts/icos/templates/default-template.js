const template = ({ componentName, jsx, exports }, { tpl }) => tpl`
import React from 'react';
import Svg, { Path } from "react-native-svg"
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const ${componentName} = ({ color = 'primary', style }: IconProps) => {
  const theme = useTheme();
  return ${jsx}
}
 
${exports};
`;

module.exports = template;
