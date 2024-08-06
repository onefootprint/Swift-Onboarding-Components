import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoCopy16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
          d="M10.167 5.833V2.167a.333.333 0 0 0-.333-.334H2.167a.333.333 0 0 0-.333.334v7.666c0 .184.149.334.333.334h3.667m.333-4.334h7.667c.184 0 .333.15.333.334v7.666c0 .184-.15.334-.333.334H6.167a.333.333 0 0 1-.333-.334V6.167c0-.184.149-.334.333-.334Z"
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
export default IcoCopy16;
