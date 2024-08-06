import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoLang16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M2.5 3.878h5.667M5.333 3.833V2.5M8 9.5C5.29 8.799 3.897 7.076 3.5 4"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.667 9.333c2.709-.68 4.102-2.35 4.5-5.333M9.563 11.417h3.541m1.063 1.416-2.21-5.849a.667.667 0 0 0-1.247 0l-2.21 5.85"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoLang16;
