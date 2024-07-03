import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoPencil16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      <g clipPath="url(#prefix__a)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12.978 1.412a1.576 1.576 0 0 0-2.229 0l-8.718 8.717a.7.7 0 0 0-.186.335l-.876 3.724a.7.7 0 0 0 .841.842l3.724-.876a.7.7 0 0 0 .335-.187l8.718-8.718a1.576 1.576 0 0 0 0-2.229l-1.609-1.608Zm-1.239.99a.176.176 0 0 1 .25 0l1.608 1.608a.176.176 0 0 1 0 .25l-1.11 1.11-1.858-1.858 1.11-1.11Zm-2.1 2.1-6.477 6.477-.572 2.43 2.43-.573 6.477-6.476-1.858-1.858Z"
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
export default IcoPencil16;
