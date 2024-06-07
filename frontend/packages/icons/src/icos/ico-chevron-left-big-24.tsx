import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoChevronLeftBig24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.983 6.138a.9.9 0 0 1-.047 1.271L9.993 12l4.943 4.59a.9.9 0 1 1-1.225 1.32l-5.653-5.25a.9.9 0 0 1 0-1.32l5.653-5.25a.9.9 0 0 1 1.272.048Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoChevronLeftBig24;
