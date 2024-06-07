import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoWorld24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M12 5.5c-.698 0-1.37.11-2 .314V9.25A3.75 3.75 0 0 1 6.25 13h-.674a6.508 6.508 0 0 0 3.84 4.966l.007-.016A8.042 8.042 0 0 0 10 15c0-.7.206-1.228.598-1.632.286-.296.665-.502.943-.654a15.8 15.8 0 0 0 .128-.07c.319-.18.585-.354.816-.632.228-.274.459-.697.607-1.42l2.098-.788c-.3.244-.533.623-.629 1.09-.188.92-.51 1.581-.922 2.077-.41.492-.87.774-1.236.98l-.177.1c-.287.158-.435.241-.552.36-.08.083-.174.215-.174.589a9.544 9.544 0 0 1-.641 3.4 6.5 6.5 0 0 0 7.143-8.9H16c-.288 0-.57.11-.81.304l-2.098.789C13.363 9.27 14.439 8 16 8h1.124A6.489 6.489 0 0 0 12 5.5Zm3.19 4.304L16 9.5l-.81.304ZM5.519 11.5A6.497 6.497 0 0 1 8.5 6.522V9.25a2.25 2.25 0 0 1-2.25 2.25h-.731ZM4 12a8 8 0 1 1 16 0 8 8 0 0 1-16 0Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoWorld24;
