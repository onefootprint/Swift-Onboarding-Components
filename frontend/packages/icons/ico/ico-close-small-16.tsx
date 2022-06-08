import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../src/types';

const IcoCloseSmall16 = ({
  color = 'primary',
  className,
  testID,
}: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={16}
      height={16}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.872 5.2a.75.75 0 1 0-1.06-1.06L8.005 6.945 5.2 4.14A.75.75 0 1 0 4.14 5.2l2.805 2.806L4.14 10.81a.75.75 0 1 0 1.06 1.06l2.806-2.805 2.805 2.806a.75.75 0 0 0 1.06-1.06L9.067 8.005 11.872 5.2Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};

export default IcoCloseSmall16;
