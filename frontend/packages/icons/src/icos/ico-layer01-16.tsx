import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoLayer0116 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M8.38 1.103a.75.75 0 0 0-.76 0L.37 5.353a.75.75 0 0 0 0 1.294L2.68 8 .37 9.353a.75.75 0 0 0 0 1.294l7.25 4.25a.75.75 0 0 0 .758 0l7.25-4.25a.75.75 0 0 0 0-1.294L13.321 8l2.308-1.353a.75.75 0 0 0 0-1.294l-7.25-4.25Zm3.458 7.766L8.38 10.897a.75.75 0 0 1-.758 0L4.16 8.869 2.234 10 8 13.38 13.767 10l-1.929-1.13ZM8 9.381 2.233 6 8 2.62 13.767 6 8 9.38Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoLayer0116;
