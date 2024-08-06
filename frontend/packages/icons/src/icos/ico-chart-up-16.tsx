import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoChartUp16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
          d="M1.833 3.167v9c0 .368.299.666.667.666h11.667M4.5 10.167l2.362-2.362c.26-.26.683-.26.943 0l.39.39c.26.26.683.26.943 0l3.36-3.359M9.833 4.5h3v3"
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
export default IcoChartUp16;
