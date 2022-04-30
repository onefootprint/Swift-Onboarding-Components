const template = (
  { imports, interfaces, componentName, props, jsx, exports },
  { tpl },
) => {
  const componentType = `${componentName}Props`;

  return tpl`
import { Properties } from 'csstype';
import React from 'react';
import { useTheme, Colors } from 'styled';

export type ${componentType} = {
  color?: Colors;
  style?: Properties;
  testID?: string;
}

const ${componentName} = ({ color = 'primary', style, testID }: ${componentType}) => {
  const theme = useTheme();
  return ${jsx}
}
 
${exports};
`;
};

module.exports = template;
