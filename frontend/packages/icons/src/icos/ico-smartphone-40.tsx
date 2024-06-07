import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoSmartphone40 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={40}
      height={40}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
      data-colored={false}
    >
      <path
        d="M16.862 28.517h-.896m16.137-4.482S33 22.41 33 20s-.897-4.034-.897-4.034M10.586 33h11.655a3.586 3.586 0 0 0 3.587-3.586V10.586A3.586 3.586 0 0 0 22.24 7H10.586A3.586 3.586 0 0 0 7 10.586v18.828A3.586 3.586 0 0 0 10.586 33Z"
        stroke={theme.color[color]}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoSmartphone40;
