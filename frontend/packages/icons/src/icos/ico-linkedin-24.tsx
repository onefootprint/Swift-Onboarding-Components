import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoLinkedin24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M18.375 4.5H5.625A1.125 1.125 0 0 0 4.5 5.625v12.75A1.125 1.125 0 0 0 5.625 19.5h12.75a1.125 1.125 0 0 0 1.125-1.125V5.625A1.125 1.125 0 0 0 18.375 4.5ZM9 17.25H6.75V10.5H9v6.75ZM7.875 9.187a1.313 1.313 0 1 1 1.35-1.312 1.335 1.335 0 0 1-1.35 1.313Zm9.375 8.063H15v-3.555c0-1.065-.45-1.447-1.035-1.447a1.304 1.304 0 0 0-1.215 1.395.485.485 0 0 0 0 .104v3.503H10.5V10.5h2.175v.975a2.331 2.331 0 0 1 2.025-1.05c1.163 0 2.52.645 2.52 2.745l.03 4.08Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoLinkedin24;
