const template = (
  { imports, interfaces, componentName, props, jsx, exports },
  { tpl },
) => tpl`
import React from 'react';
import Svg, { Path } from "react-native-svg"

import type { FlagProps } from '../types';

const ${componentName} = ({ style }: FlagProps) => ${jsx}
 
${exports};
`;

module.exports = template;
