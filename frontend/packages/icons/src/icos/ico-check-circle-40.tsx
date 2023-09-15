import { useTheme } from '@onefootprint/styled';
import React from 'react';

import type { IconProps } from '../types';

const IcoCheckCircle40 = ({
  'aria-label': ariaLabel,
  color = 'primary',
  className,
  testID,
}: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={40}
      height={40}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M20.005 4.6C11.497 4.6 4.6 11.497 4.6 20.005s6.897 15.404 15.405 15.404 15.404-6.896 15.404-15.404S28.513 4.6 20.005 4.6ZM8.1 20.005C8.1 13.43 13.43 8.1 20.005 8.1c6.575 0 11.904 5.33 11.904 11.905 0 6.575-5.33 11.904-11.904 11.904C13.43 31.91 8.1 26.58 8.1 20.005Zm17.443-3.491a1.5 1.5 0 1 0-2.602-1.493l-4.32 7.528a.383.383 0 0 1-.68-.028l-.816-1.74a1.5 1.5 0 1 0-2.716 1.273l.817 1.741c1.163 2.479 4.635 2.622 5.998.247l4.32-7.529Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoCheckCircle40;
