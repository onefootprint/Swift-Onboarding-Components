import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoIncognito16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={16}
      height={16}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
      data-colored={false}
    >
      <path
        d="M9.034 11.931H6.966M2 8.621s.338-.293 1.034-.633m0 0C3.994 7.522 5.632 6.966 8 6.966c2.368 0 4.005.556 4.966 1.022m-9.932 0 .467-4.503A1.655 1.655 0 0 1 5.148 2h5.705a1.655 1.655 0 0 1 1.646 1.485l.466 4.503m0 0c.697.34 1.035.633 1.035.633m-7.448 3.517a1.862 1.862 0 1 1-3.724 0 1.862 1.862 0 0 1 3.724 0Zm6.62 0a1.862 1.862 0 1 1-3.724 0 1.862 1.862 0 0 1 3.724 0Z"
        stroke={theme.color[color]}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoIncognito16;
