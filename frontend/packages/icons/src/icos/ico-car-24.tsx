import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoCar24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={24}
      height={24}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
      data-colored={false}
    >
      <path
        d="M3.667 10.75 6.75 6.51a.833.833 0 0 1 .674-.343h9.142c.272 0 .526.132.682.353l3.085 4.385M3.666 10.75h-.833m.833 0V17c0 .46.373.833.833.833h1.667c.46 0 .833-.373.833-.833v-.833h10V17c0 .46.373.833.834.833H19.5c.46 0 .834-.373.834-.833v-6.095m0 0h.833M7 12.833h1.667m6.667 0H17"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoCar24;
