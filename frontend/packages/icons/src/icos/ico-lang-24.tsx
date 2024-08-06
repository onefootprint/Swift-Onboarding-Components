import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoLang24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M5.125 6.847h7.083M8.666 6.792V5.125M12 13.875C8.612 12.999 6.87 10.845 6.375 7"
        stroke={theme.color[color]}
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.333 13.667c3.387-.85 5.129-2.94 5.626-6.667M13.953 16.27h4.427m1.328 1.772-2.762-7.312c-.271-.718-1.288-.718-1.559 0l-2.762 7.312"
        stroke={theme.color[color]}
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoLang24;
