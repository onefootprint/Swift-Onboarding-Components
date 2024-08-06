import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoEye24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      viewBox="0 0 24 24"
    >
      <path
        d="M4.41 11.921C6.345 8.298 9.219 6.583 12 6.583c2.781 0 5.655 1.715 7.59 5.338l1.102-.588c-2.1-3.935-5.35-6-8.692-6-3.342 0-6.592 2.065-8.692 6l1.103.588Zm-1.102.746c2.1 3.935 5.35 6 8.692 6 3.342 0 6.592-2.065 8.692-6l-1.103-.588c-1.934 3.623-4.808 5.338-7.59 5.338-2.78 0-5.655-1.715-7.588-5.338l-1.103.588Zm0-1.334c-.222.415-.222.92 0 1.334l1.103-.588a.173.173 0 0 1 0-.158l-1.103-.588Zm16.281.588a.174.174 0 0 1 0 .158l1.103.588c.221-.415.221-.92 0-1.334l-1.103.588ZM14.083 12c0 1.15-.933 2.083-2.083 2.083v1.25A3.333 3.333 0 0 0 15.333 12h-1.25ZM12 14.083A2.083 2.083 0 0 1 9.916 12h-1.25A3.333 3.333 0 0 0 12 15.333v-1.25ZM9.916 12c0-1.15.933-2.083 2.084-2.083v-1.25A3.333 3.333 0 0 0 8.666 12h1.25ZM12 9.917c1.15 0 2.083.932 2.083 2.083h1.25A3.333 3.333 0 0 0 12 8.667v1.25Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoEye24;
