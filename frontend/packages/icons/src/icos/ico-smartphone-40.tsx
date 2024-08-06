import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoSmartphone40 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={40}
      height={40}
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
          d="M16.667 31.667h6.666m-11.666 5h16.666c.92 0 1.667-.747 1.667-1.667V5c0-.92-.746-1.667-1.667-1.667H11.667C10.747 3.333 10 4.08 10 5v30c0 .92.746 1.667 1.667 1.667Z"
          stroke={theme.color[color]}
          strokeWidth={3.333}
          strokeLinecap="round"
        />
      </g>
      <defs>
        <clipPath id="prefix__a">
          <path fill="#fff" d="M0 0h40v40H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};
export default IcoSmartphone40;
