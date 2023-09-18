const template = ({ componentName, jsx, exports }, { tpl }) => tpl`
import React from 'react';

import type { FlagProps } from '../types';

const ${componentName} = ({ className, testID }: FlagProps) => ${jsx}
 
${exports};
`;

module.exports = template;
