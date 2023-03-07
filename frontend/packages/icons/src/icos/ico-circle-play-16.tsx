import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoCirclePlay16 = ({
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
        d="M8 1.5A6.502 6.502 0 0 0 1.5 8c0 3.589 2.911 6.5 6.5 6.5s6.5-2.911 6.5-6.5S11.589 1.5 8 1.5ZM2.5 8c0-3.036 2.464-5.5 5.5-5.5s5.5 2.464 5.5 5.5-2.464 5.5-5.5 5.5A5.502 5.502 0 0 1 2.5 8Zm7.837.29L6.76 10.452a.336.336 0 0 1-.51-.29V5.84a.337.337 0 0 1 .51-.291l3.577 2.16a.34.34 0 0 1 0 .582Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoCirclePlay16;
