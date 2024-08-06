import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoGlobe16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
          d="M8 14.167A6.167 6.167 0 0 0 8 1.833m0 12.334A6.167 6.167 0 0 1 8 1.833m0 12.334c-1.565 0-2.833-2.761-2.833-6.167 0-3.406 1.268-6.167 2.833-6.167m0 12.334c1.565 0 2.834-2.761 2.834-6.167 0-3.406-1.269-6.167-2.834-6.167M14 8H2"
          stroke={theme.color[color]}
          strokeWidth={1.5}
          strokeLinecap="square"
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
export default IcoGlobe16;
