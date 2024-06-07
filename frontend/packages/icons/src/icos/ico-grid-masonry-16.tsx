import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoGridMasonry16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M1.5 3A1.5 1.5 0 0 1 3 1.5h2.8A1.5 1.5 0 0 1 7.3 3v9.998a1.5 1.5 0 0 1-1.5 1.5H3a1.5 1.5 0 0 1-1.5-1.5V3ZM3 2.9a.1.1 0 0 0-.1.1v9.998a.1.1 0 0 0 .1.1h2.8a.1.1 0 0 0 .1-.1V3a.1.1 0 0 0-.1-.1H3Zm5.699.1a1.5 1.5 0 0 1 1.5-1.5h2.799a1.5 1.5 0 0 1 1.5 1.5v2.8a1.5 1.5 0 0 1-1.5 1.5h-2.8a1.5 1.5 0 0 1-1.5-1.5V3Zm1.5-.1a.1.1 0 0 0-.1.1v2.8a.1.1 0 0 0 .1.1h2.799a.1.1 0 0 0 .1-.1V3a.1.1 0 0 0-.1-.1h-2.8Zm0 5.798a1.5 1.5 0 0 0-1.5 1.5v2.8a1.5 1.5 0 0 0 1.5 1.5h2.799a1.5 1.5 0 0 0 1.5-1.5v-2.8a1.5 1.5 0 0 0-1.5-1.5h-2.8Zm-.1 1.5a.1.1 0 0 1 .1-.1h2.799a.1.1 0 0 1 .1.1v2.8a.1.1 0 0 1-.1.1h-2.8a.1.1 0 0 1-.1-.1v-2.8Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoGridMasonry16;
