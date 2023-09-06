const template = ({ componentName, jsx, exports }, { tpl }) => tpl`
import React from 'react';
import { useTheme } from '@onefootprint/styled';

import type { IconProps } from '../types';

const ${componentName} = ({ color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return ${jsx}
}
 
${exports};
`;

module.exports = template;
