import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoEmail16 = ({ color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={16}
      height={16}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      data-testid={testID}
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.017 1.37A2.597 2.597 0 0 0 .42 3.967v8.064a2.597 2.597 0 0 0 2.597 2.597h9.961a2.597 2.597 0 0 0 2.598-2.597V3.967a2.597 2.597 0 0 0-2.598-2.597h-9.96Zm-.134 1.407a1.21 1.21 0 0 1 .134-.007h9.961c.046 0 .09.003.134.007L7.998 7.302 2.883 2.777Zm-1.039.95a1.203 1.203 0 0 0-.024.24v8.064c0 .661.536 1.197 1.197 1.197h9.961c.662 0 1.198-.536 1.198-1.197V3.967c0-.082-.009-.162-.024-.24l-5.69 5.034a.7.7 0 0 1-.928 0l-5.69-5.034Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};

export default IcoEmail16;
