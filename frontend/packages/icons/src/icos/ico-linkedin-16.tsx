import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoLinkedin16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      viewBox="0 0 16 16"
    >
      <g clipPath="url(#prefix__a)">
        <path
          d="M13.1 2H2.9a.9.9 0 0 0-.9.9v10.2a.9.9 0 0 0 .9.9h10.2a.9.9 0 0 0 .9-.9V2.9a.9.9 0 0 0-.9-.9ZM5.6 12.2H3.8V6.8h1.8v5.4Zm-.9-6.45A1.05 1.05 0 1 1 5.78 4.7 1.068 1.068 0 0 1 4.7 5.75Zm7.5 6.45h-1.8V9.356c0-.852-.36-1.158-.828-1.158A1.043 1.043 0 0 0 8.6 9.314a.393.393 0 0 0 0 .084V12.2H6.8V6.8h1.74v.78a1.866 1.866 0 0 1 1.62-.84c.93 0 2.016.516 2.016 2.196L12.2 12.2Z"
          fill={theme.color[color]}
        />
      </g>
      <defs>
        <clipPath id="prefix__a">
          <path fill="#fff" d="M0 0h16v16H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};
export default IcoLinkedin16;
