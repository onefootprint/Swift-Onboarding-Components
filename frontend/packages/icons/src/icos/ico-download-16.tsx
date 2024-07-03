import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoDownload16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M8 1.5a.7.7 0 0 1 .7.7v5.816l1.386-1.493a.7.7 0 0 1 1.026.953l-2.594 2.793a.698.698 0 0 1-1.036.002L4.887 7.476a.7.7 0 1 1 1.025-.953L7.3 8.016V2.2a.7.7 0 0 1 .7-.7ZM2.2 9.499a.7.7 0 0 1 .7.7v1.2a1.7 1.7 0 0 0 1.7 1.7h6.799a1.7 1.7 0 0 0 1.7-1.7v-1.2a.7.7 0 1 1 1.4 0v1.2a3.1 3.1 0 0 1-3.1 3.1h-6.8a3.1 3.1 0 0 1-3.099-3.1v-1.2a.7.7 0 0 1 .7-.7Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoDownload16;
