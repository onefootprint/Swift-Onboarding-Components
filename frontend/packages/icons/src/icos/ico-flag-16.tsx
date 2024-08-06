import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoFlag16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      <g clipPath="url(#prefix__a)">
        <path
          d="M3.167 10.056V2.933c0-.254.143-.485.379-.58.506-.202 1.447-.52 2.382-.52 1.375 0 2.768 1.37 4.143 1.37.63 0 1.262-.143 1.762-.299.472-.147 1 .193 1 .687v6.05a.615.615 0 0 1-.38.58c-.505.203-1.446.52-2.382.52-1.375 0-2.768-1.37-4.143-1.37s-2.761.684-2.761.684Zm0 0v4.11"
          stroke={theme.color[color]}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="prefix__a">
          <path fill="#fff" d="M0 0h16v16H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};
export default IcoFlag16;
