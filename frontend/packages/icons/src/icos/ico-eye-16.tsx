import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoEye16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M1.85 8.007c0-.106.066-.496.29-1.065A7.384 7.384 0 0 1 3.179 5.13c.96-1.225 2.483-2.33 4.824-2.33 2.341 0 3.865 1.105 4.824 2.33a7.383 7.383 0 0 1 1.037 1.812c.225.569.29.96.29 1.065 0 .105-.065.496-.29 1.064a7.383 7.383 0 0 1-1.037 1.812c-.96 1.226-2.483 2.33-4.824 2.33-2.341 0-3.865-1.104-4.824-2.33a7.384 7.384 0 0 1-1.037-1.812c-.225-.568-.291-.959-.291-1.064ZM8.002 1.4c-2.857 0-4.76 1.376-5.927 2.868-.578.74-.98 1.509-1.236 2.16C.59 7.056.45 7.64.45 8.007s.14.951.389 1.579c.257.65.658 1.42 1.236 2.16 1.168 1.491 3.07 2.868 5.927 2.868 2.857 0 4.76-1.377 5.926-2.868.58-.74.98-1.51 1.237-2.16.248-.628.389-1.212.389-1.58 0-.366-.14-.95-.389-1.578a8.782 8.782 0 0 0-1.237-2.16C12.761 2.776 10.858 1.4 8.002 1.4ZM6.575 8.007a1.426 1.426 0 1 1 2.853 0 1.426 1.426 0 0 1-2.853 0ZM8.002 5.18a2.826 2.826 0 1 0 0 5.653 2.826 2.826 0 0 0 0-5.653Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoEye16;
