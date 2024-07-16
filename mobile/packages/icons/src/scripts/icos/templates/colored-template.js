const template = ({ componentName, jsx, exports }, { tpl }) => tpl`
  import React from 'react';
  import Svg, { Path } from "react-native-svg"

  import type { IconProps } from '../types';
  
  const ${componentName} = ({ style }: IconProps) => {
    return ${jsx}
  }
   
  ${exports};
  `;

module.exports = template;
