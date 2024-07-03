import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoShuffle16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M13.25 9.75 15 11.5l-1.75 1.75m0-10.5L15 4.5l-1.75 1.75M1 11.5h3.106a2.916 2.916 0 0 0 2.427-1.299L8 8M1 4.5h3.106a2.917 2.917 0 0 1 2.427 1.299L9.467 10.2a2.916 2.916 0 0 0 2.427 1.299h1.94m0-7h-1.94a2.916 2.916 0 0 0-2.427 1.299l-.3.451"
        stroke={theme.color[color]}
        strokeWidth={1.167}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoShuffle16;
