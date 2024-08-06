import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoWorld24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      viewBox="0 0 24 24"
    >
      <path
        d="m13.87 4.52-.913 3.662a.833.833 0 0 1-.606.606l-2.475.623a.833.833 0 0 0-.54.433l-.22.434a.833.833 0 0 1-1.243.292L5.125 8.51m8.746-3.99a7.708 7.708 0 0 0-8.746 3.99m8.746-3.99a7.708 7.708 0 1 1-8.746 3.99m6.63 7.286-1.04-1.56a.833.833 0 0 1 .105-1.052l.174-.173a.833.833 0 0 1 .64-.241l1.02.065c.147.01.29.057.412.14l1.661 1.116c.348.234.468.69.28 1.065l-.274.55a.833.833 0 0 1-.746.46h-1.539a.833.833 0 0 1-.693-.37Z"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoWorld24;
