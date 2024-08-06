import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoFacebook24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M9.987 20.088v-5.541h-1.72V12h1.72v-1.097c0-2.837 1.283-4.15 4.066-4.15.527 0 1.437.103 1.81.206v2.307c-.196-.02-.54-.03-.963-.03-1.367 0-1.894.517-1.894 1.864v.9h2.724l-.467 2.546H13.01v5.727a8.333 8.333 0 1 0-3.024-.185Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoFacebook24;
