import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoDragAndDrop16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      <g clipPath="url(#prefix__a)" fill={theme.color[color]}>
        <path d="M5 3.833a1.167 1.167 0 1 1 2.333 0 1.167 1.167 0 0 1-2.333 0ZM8.666 3.833a1.167 1.167 0 1 1 2.334 0 1.167 1.167 0 0 1-2.334 0ZM5 12.167a1.167 1.167 0 1 1 2.333 0 1.167 1.167 0 0 1-2.333 0ZM8.666 12.167a1.167 1.167 0 1 1 2.334 0 1.167 1.167 0 0 1-2.334 0ZM5 7.933a1.167 1.167 0 1 1 2.333 0V8A1.167 1.167 0 1 1 5 8v-.067ZM8.666 7.933a1.167 1.167 0 0 1 2.334 0V8a1.167 1.167 0 1 1-2.334 0v-.067Z" />
      </g>
      <defs>
        <clipPath id="prefix__a">
          <path fill="#fff" d="M0 0h16v16H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};
export default IcoDragAndDrop16;
