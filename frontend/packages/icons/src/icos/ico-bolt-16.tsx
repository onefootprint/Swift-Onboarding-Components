import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoBolt16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
          d="M13.199 5.833H9.167a.333.333 0 0 1-.333-.333V1.57a.333.333 0 0 0-.608-.189L2.527 9.644a.333.333 0 0 0 .275.523h4.032c.184 0 .333.149.333.333v3.93c0 .327.422.458.608.189l5.698-8.263a.333.333 0 0 0-.274-.523Z"
          stroke={theme.color[color]}
          strokeWidth={1.5}
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
export default IcoBolt16;
