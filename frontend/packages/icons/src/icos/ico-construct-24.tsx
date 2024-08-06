import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoConstruct24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M12.625 10.958V5.125c0-.46.373-.833.833-.833h3.75c.46 0 .834.373.834.833v5.833m-5.417-3.333h2.083m-8.75 3.333V7.21c0-.138.034-.274.1-.395l1.161-2.156a.698.698 0 0 1 1.228 0L9.61 6.815c.065.121.1.257.1.395v3.748m-5.417 0h15.416v7.084c0 .46-.373.833-.833.833H5.125a.833.833 0 0 1-.833-.833v-7.084Z"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoConstruct24;
