import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoArrowTopRight16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.372 1a.75.75 0 1 0 0 1.5h2.07L4.254 7.686a.75.75 0 0 0 1.06 1.061l5.187-5.186V5.63a.75.75 0 0 0 1.5 0V1.75a.75.75 0 0 0-.75-.75h-3.88Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoArrowTopRight16;
