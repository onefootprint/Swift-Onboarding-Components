import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoChevronRightBig24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M9.01 6.137a.9.9 0 0 1 1.273-.046l5.65 5.25a.9.9 0 0 1 0 1.318l-5.65 5.25a.9.9 0 0 1-1.226-1.318L13.997 12l-4.94-4.59a.9.9 0 0 1-.046-1.273Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoChevronRightBig24;
