import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoLaptop24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M6.748 4a1.75 1.75 0 0 0-1.75 1.75v8.5c0 .042.004.083.01.124l-.74 3.516A1.75 1.75 0 0 0 5.981 20h12.035a1.75 1.75 0 0 0 1.712-2.11l-.74-3.516a.763.763 0 0 0 .01-.124v-8.5A1.75 1.75 0 0 0 17.248 4h-10.5Zm10.839 11H6.409l-.673 3.198a.25.25 0 0 0 .245.302h12.035a.25.25 0 0 0 .244-.302L17.587 15ZM6.498 5.75a.25.25 0 0 1 .25-.25h10.5a.25.25 0 0 1 .25.25v7.75h-11V5.75Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoLaptop24;
