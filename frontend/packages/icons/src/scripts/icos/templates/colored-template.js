const template = ({ componentName, jsx, exports }, { tpl }) => tpl`
  import React from 'react';
  
  import type { IconProps } from '../types';
  
  const ${componentName} = ({ 'aria-label': ariaLabel, className, testID }: IconProps) => {
    return ${jsx}
  }
   
  ${exports};
  `;

module.exports = template;
