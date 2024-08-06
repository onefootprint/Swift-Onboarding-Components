import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoShuffle16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
          d="M2 12h1.057c.177 0 .347-.07.472-.195l6.942-6.943a.667.667 0 0 1 .472-.195h1.724M2 4h1.057c.177 0 .347.07.472.195L5.333 6m7.334 5.333h-1.724a.667.667 0 0 1-.472-.195L9.333 10M12 2.667l2 2-2 2m0 2.666 2 2-2 2"
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
export default IcoShuffle16;
