import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoDownload24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M18.875 14.292v3.75c0 .46-.373.833-.833.833H5.958a.833.833 0 0 1-.833-.833v-3.75M12 14.5V5.125m0 9.375-2.917-2.917M12 14.5l2.917-2.917"
        stroke={theme.color[color]}
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoDownload24;
