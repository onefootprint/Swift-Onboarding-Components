import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoQuoteLeft16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
          d="M5.92 3a.5.5 0 0 0-.1.01c-.055.01-2.08.36-3.478 2.04C1.16 6.47 1.07 7.874 1.001 8.887c-.002.029 0 .056.002.084l-.001.035c0 1.46.955 3.213 3.285 3.214 1.783 0 3.155-1.325 3.155-3.214 0-1.246-.56-3.214-3.08-3.214-.495 0-.946.087-1.348.243.063-.092.13-.184.2-.276.705-.91 1.814-1.536 2.818-1.775A.5.5 0 0 0 5.921 3Zm7.5 0a.5.5 0 0 0-.1.01c-.055.01-2.08.36-3.478 2.04C8.659 6.47 8.57 7.874 8.502 8.887c-.002.029 0 .056.002.084l-.001.035c0 1.46.955 3.213 3.285 3.214 1.783 0 3.155-1.325 3.155-3.214 0-1.246-.56-3.214-3.08-3.214-.495 0-.946.087-1.348.243a6.18 6.18 0 0 1 .2-.276c.705-.91 1.814-1.536 2.818-1.775A.5.5 0 0 0 13.421 3Z"
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
export default IcoQuoteLeft16;
