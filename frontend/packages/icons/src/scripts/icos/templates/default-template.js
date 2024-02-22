const template = ({ componentName, jsx, exports }, { tpl }) => tpl`
import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const ${componentName} = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return ${jsx}
}
 
${exports};
`;

module.exports = template;
