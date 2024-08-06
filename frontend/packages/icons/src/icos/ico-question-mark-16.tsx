import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoQuestionMark16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
          d="M6.5 6.167v-.334c0-.368.299-.666.667-.666h1.667c.368 0 .666.298.666.666v.81a.667.667 0 0 1-.297.555l-.906.604A.667.667 0 0 0 8 8.357v.476m0 1.834v-.007M14.167 8A6.167 6.167 0 1 1 1.833 8a6.167 6.167 0 0 1 12.334 0Zm-6 2.667a.167.167 0 1 1-.333 0 .167.167 0 0 1 .333 0Z"
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
export default IcoQuestionMark16;
