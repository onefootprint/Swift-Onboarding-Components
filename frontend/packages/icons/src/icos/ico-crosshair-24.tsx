import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoCrosshair24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M12 4a.75.75 0 0 1 .75.75v.29a7.003 7.003 0 0 1 6.21 6.21h.29a.75.75 0 0 1 0 1.5h-.29a7.003 7.003 0 0 1-6.21 6.21v.29a.75.75 0 0 1-1.5 0v-.29a7.003 7.003 0 0 1-6.21-6.21h-.29a.75.75 0 0 1 0-1.5h.29a7.003 7.003 0 0 1 6.21-6.21v-.29A.75.75 0 0 1 12 4Zm-5.45 8.75h2.7a.75.75 0 0 0 0-1.5h-2.7a5.503 5.503 0 0 1 4.7-4.7v2.7a.75.75 0 1 0 1.5 0v-2.7a5.503 5.503 0 0 1 4.7 4.7h-2.7a.75.75 0 0 0 0 1.5h2.7a5.503 5.503 0 0 1-4.7 4.7v-2.7a.75.75 0 0 0-1.5 0v2.7a5.503 5.503 0 0 1-4.7-4.7Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoCrosshair24;
