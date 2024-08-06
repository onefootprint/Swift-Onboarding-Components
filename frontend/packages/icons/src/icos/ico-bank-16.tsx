import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoBank16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
          d="M12.834 6.167V11.5m-2.667 0V6.167m-7 0V11.5m2.667 0V6.167M13.02 11.5H2.98a.667.667 0 0 0-.632.456l-.222.667a.667.667 0 0 0 .632.877h10.484a.667.667 0 0 0 .632-.877l-.222-.667a.667.667 0 0 0-.632-.456Zm.48-5.333h-11a.667.667 0 0 1-.667-.667v-.308c0-.251.142-.481.367-.595L7.7 1.82a.667.667 0 0 1 .6 0l5.5 2.778a.667.667 0 0 1 .367.595V5.5a.667.667 0 0 1-.667.667Z"
          stroke={theme.color[color]}
          strokeWidth={1.3}
          strokeLinecap="square"
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
export default IcoBank16;
