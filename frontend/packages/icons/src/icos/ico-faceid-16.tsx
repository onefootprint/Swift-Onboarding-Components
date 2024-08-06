import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoFaceid16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      viewBox="0 0 16 16"
    >
      <g clipPath="url(#prefix__a)">
        <path
          d="M5.5 2.5H3.167a.667.667 0 0 0-.667.667V5.5m0 5v2.333c0 .368.298.667.667.667H5.5m5-11h2.333c.368 0 .667.298.667.667V5.5m0 5v2.333a.667.667 0 0 1-.667.667H10.5M8.167 5.833v1.5c0 .68-.51 1.241-1.167 1.323M5.167 5.833v1m5.666-1v1M6 10.465c.588.34 1.271.535 2 .535.729 0 1.412-.195 2-.535"
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
export default IcoFaceid16;
