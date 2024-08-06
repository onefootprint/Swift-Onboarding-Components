import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoVisaPassport24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M9.917 15.333h4.166m-7.5 3.75h10.834c.46 0 .833-.373.833-.833V5.75a.833.833 0 0 0-.833-.833H6.583a.833.833 0 0 0-.833.833v12.5c0 .46.373.833.833.833Z"
        stroke={theme.color[color]}
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m12.092 7.759.586.904 1.041-.28-.131 1.07.976.455-.788.735.456.976-1.076.056-.279 1.041-.86-.649-.883.619-.242-1.05-1.073-.094.49-.96-.763-.762.992-.42-.094-1.074 1.03.316.618-.883Z"
        stroke={theme.color[color]}
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoVisaPassport24;
