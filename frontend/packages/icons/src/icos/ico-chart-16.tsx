import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoChart16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
          d="m10.667 14.5-.571-2m-4.763 2 .572-2m-.738-4v1M8 5.167V9.5m2.834-2.333V9.5m-9-6.333V11.5c0 .368.298.667.666.667h11a.667.667 0 0 0 .667-.667V3.167A.667.667 0 0 0 13.5 2.5h-11a.667.667 0 0 0-.667.667Z"
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
export default IcoChart16;
