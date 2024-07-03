import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoLayer0124 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M12.38 5.103a.75.75 0 0 0-.76 0l-7.25 4.25a.75.75 0 0 0 0 1.294L6.68 12 4.37 13.353a.75.75 0 0 0 0 1.294l7.25 4.25a.75.75 0 0 0 .758 0l7.25-4.25a.75.75 0 0 0 0-1.294L17.321 12l2.308-1.353a.75.75 0 0 0 0-1.294l-7.25-4.25Zm3.458 7.766-3.459 2.028a.75.75 0 0 1-.758 0l-3.46-2.028L6.234 14 12 17.38 17.767 14l-1.929-1.13ZM12 13.381 6.233 10 12 6.62 17.767 10 12 13.38Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoLayer0124;
