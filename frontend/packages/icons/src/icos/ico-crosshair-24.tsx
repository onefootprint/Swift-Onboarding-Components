import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoCrosshair24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={24}
      height={24}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
      data-colored={false}
      viewBox="0 0 24 24"
    >
      <g clipPath="url(#prefix__a)">
        <path
          d="M12 3.458v5.417M20.542 12h-5.417M12 15.125v5.417M8.875 12H3.458M12 18.042a6.042 6.042 0 1 1 0-12.084 6.042 6.042 0 0 1 0 12.084Z"
          stroke={theme.color[color]}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="prefix__a">
          <path fill="#fff" transform="translate(2 2)" d="M0 0h20v20H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};
export default IcoCrosshair24;
