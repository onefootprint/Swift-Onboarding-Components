import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoWww16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
    >
      <g clipPath="url(#prefix__a)" stroke={theme.color[color]} strokeWidth={1.5} strokeLinejoin="round">
        <path d="M14.167 8A6.167 6.167 0 1 1 1.833 8a6.167 6.167 0 0 1 12.334 0Z" />
        <path d="m9.77 5.82-2.736.746a.667.667 0 0 0-.468.468L5.82 9.771a.333.333 0 0 0 .41.409l2.736-.746a.667.667 0 0 0 .468-.468l.746-2.737a.333.333 0 0 0-.41-.409Z" />
      </g>
      <defs>
        <clipPath id="prefix__a">
          <path fill="#fff" d="M0 0h16v16H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};
export default IcoWww16;
