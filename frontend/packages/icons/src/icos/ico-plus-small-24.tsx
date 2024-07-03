import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoPlusSmall24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M12.85 7a.85.85 0 0 0-1.7 0v4.15H7a.85.85 0 0 0 0 1.7h4.15V17a.85.85 0 0 0 1.7 0v-4.15H17a.85.85 0 0 0 0-1.7h-4.15V7Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoPlusSmall24;
