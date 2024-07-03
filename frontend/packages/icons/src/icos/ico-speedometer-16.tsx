import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoSpeedometer16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M8 2C4.03 2 .8 5.23.8 9.2c0 1.737.621 3.33 1.65 4.575l.169.225H13.38l.169-.225A7.158 7.158 0 0 0 15.2 9.2C15.2 5.23 11.97 2 8 2Zm0 1.2c3.321 0 6 2.679 6 6 0 1.36-.476 2.595-1.238 3.6H3.237C2.476 11.794 2 10.56 2 9.2c0-3.321 2.679-6 6-6Zm0 .6A.601.601 0 0 0 8 5a.601.601 0 0 0 0-1.2Zm-2.4.638a.601.601 0 0 0 0 1.2.601.601 0 0 0 0-1.2Zm4.8 0a.601.601 0 0 0 0 1.2.601.601 0 0 0 0-1.2ZM3.837 6.2a.601.601 0 0 0 0 1.2.601.601 0 0 0 0-1.2Zm8.157.019L8.6 8.169A1.19 1.19 0 0 0 8 8a1.2 1.2 0 1 0 1.2 1.219V9.2l3.394-1.931-.6-1.05ZM3.2 8.6a.601.601 0 0 0 0 1.2.601.601 0 0 0 0-1.2Zm9.6 0a.601.601 0 0 0 0 1.2.601.601 0 0 0 0-1.2ZM3.837 11a.601.601 0 0 0 0 1.2.601.601 0 0 0 0-1.2Zm8.325 0a.601.601 0 0 0 0 1.2.601.601 0 0 0 0-1.2Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoSpeedometer16;
