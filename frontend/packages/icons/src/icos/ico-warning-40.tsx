import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoWarning40 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      data-colored={false}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M22.007 9.169c-.827-1.651-3.184-1.652-4.011-.001l-9.85 19.647c-.749 1.492.336 3.249 2.004 3.249h19.693c1.668 0 2.753-1.756 2.006-3.248L22.007 9.169Zm-6.693-1.346c1.935-3.858 7.442-3.857 9.375.002l9.842 19.647c1.747 3.487-.789 7.592-4.688 7.592H10.15c-3.9 0-6.436-4.107-4.688-7.593l9.851-19.648Zm4.681 6.761c.92 0 1.667.747 1.667 1.667v3.743a1.667 1.667 0 1 1-3.333 0v-3.743c0-.92.746-1.667 1.666-1.667Zm-.07 11.215a1.667 1.667 0 1 0 0 3.333 1.667 1.667 0 0 0 0-3.333Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoWarning40;
