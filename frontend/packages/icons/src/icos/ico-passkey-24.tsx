import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoPasskey24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M11.312 12.684c-3.163 0-5.472 2.102-6.107 4.93-.108.478.281.903.772.903h7.002m1.25-11.25a2.917 2.917 0 1 1-5.834 0 2.917 2.917 0 0 1 5.834 0Z"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.314 11.017a2.5 2.5 0 0 0-1.042 4.773v2.943c0 .127.057.247.156.326l.625.5a.417.417 0 0 0 .52 0l.626-.5a.417.417 0 0 0 .156-.326v-.694l-.625-.564.625-.625v-1.06a2.5 2.5 0 0 0-1.041-4.773Zm-.834 2.5a.833.833 0 1 1 1.667 0 .833.833 0 0 1-1.667 0Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoPasskey24;
