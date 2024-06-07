import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoPassportCard16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1.45 3.773c0-.157.13-.293.3-.293h12.5c.17 0 .3.136.3.293v8.444c0 .157-.13.293-.3.293H1.75c-.17 0-.3-.136-.3-.293V3.773Zm.3-1.693c-.934 0-1.7.754-1.7 1.693v8.444c0 .94.766 1.693 1.7 1.693h12.5c.934 0 1.7-.754 1.7-1.693V3.773c0-.94-.766-1.693-1.7-1.693H1.75Zm4.981 4.607a1.269 1.269 0 1 1 2.538 0 1.269 1.269 0 0 1-2.538 0ZM8 4.02a2.669 2.669 0 1 0 0 5.337A2.669 2.669 0 0 0 8 4.02ZM6.031 10a.7.7 0 1 0 0 1.4H9.97a.7.7 0 0 0 0-1.4H6.03Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoPassportCard16;
