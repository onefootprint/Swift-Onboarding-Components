import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoPassport241 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M5.04 4.79a.75.75 0 0 1 .75-.75h10.435a2.738 2.738 0 0 1 2.737 2.738v10.434a2.738 2.738 0 0 1-2.737 2.738H5.79a.75.75 0 0 1-.75-.75V4.79Zm1.5.75v12.91h9.685c.683 0 1.237-.554 1.237-1.238V6.778c0-.684-.554-1.238-1.237-1.238H6.54Zm4.893 2.981a1.486 1.486 0 1 0 0 2.972 1.486 1.486 0 0 0 0-2.972Zm-2.986 1.486a2.986 2.986 0 1 1 5.972 0 2.986 2.986 0 0 1-5.972 0Zm.75 4.468a.75.75 0 0 0 0 1.5h4.472a.75.75 0 0 0 0-1.5H9.197Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoPassport241;
