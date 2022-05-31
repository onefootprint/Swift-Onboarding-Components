const template = (
  { imports, interfaces, componentName, props, jsx, exports },
  { tpl },
) => tpl`
import React from 'react';

import type { FlagProps } from '../src/types';

const ${componentName} = ({ className, testID }: FlagProps) => ${jsx}
 
${exports};
`;

module.exports = template;
