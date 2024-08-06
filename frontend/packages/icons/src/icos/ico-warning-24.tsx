import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoWarning24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M12 10.125v2.917m0 2.083v-.008m-.719-10.431L4.193 16.787a.833.833 0 0 0 .72 1.255h14.175a.833.833 0 0 0 .719-1.255L12.719 4.686a.833.833 0 0 0-1.438 0Zm.927 10.439a.208.208 0 1 1-.416 0 .208.208 0 0 1 .416 0Z"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </svg>
  );
};
export default IcoWarning24;
