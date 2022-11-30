const template = (
  { imports, interfaces, componentName, props, jsx, exports },
  { tpl },
) => tpl`
  import React from 'react';
  
  import type { IconProps } from '../types';
  
  const ${componentName} = ({ className, testID }: IconProps) => {
    return ${jsx}
  }
   
  ${exports};
  `;

module.exports = template;
