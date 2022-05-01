const template = (
  { imports, interfaces, componentName, props, jsx, exports },
  { tpl },
) => tpl`
import React from 'react';
import { useTheme } from 'styled';

import type { IconProps } from '../src/types';

const ${componentName} = ({ color = 'primary', style, testID }: IconProps) => {
  const theme = useTheme();
  return ${jsx}
}
 
${exports};
`;

module.exports = template;
