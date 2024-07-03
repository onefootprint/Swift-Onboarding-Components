import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoFingerprint24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M18.75 18.75V12c0-2.412-1.31-4.692-3.256-5.819m-10.233 8.38v4.189M5.261 12.233C5.03 7.81 8.41 5.25 12.006 5.25M12.006 8.974c1.67 0 3.023 1.164 3.023 3.259M15.029 14.56v1.397M8.982 15.492v1.396c0 1.164-.93 1.862-.93 1.862M11.773 12.698v3.259c0 1.63.744 2.793 2.79 2.793M9.323 10.604c-.218.417-.34.892-.34 1.396v1.164"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoFingerprint24;
