import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoStar16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
          d="M7.7 1.355a.333.333 0 0 1 .6 0l1.713 3.57a.333.333 0 0 0 .256.186l3.941.516a.332.332 0 0 1 .186.57l-2.882 2.721a.331.331 0 0 0-.098.302l.723 3.887a.333.333 0 0 1-.486.352l-3.495-1.887a.334.334 0 0 0-.316 0L4.346 13.46a.333.333 0 0 1-.485-.352l.724-3.887a.331.331 0 0 0-.099-.302l-2.882-2.72a.332.332 0 0 1 .186-.57l3.94-.517a.333.333 0 0 0 .257-.186L7.7 1.355Z"
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
export default IcoStar16;
