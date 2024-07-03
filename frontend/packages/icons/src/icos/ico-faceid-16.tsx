import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoFaceid16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M5.63 1.75h-.432A3.448 3.448 0 0 0 1.75 5.198v.431m3.88 8.621h-.432a3.448 3.448 0 0 1-3.448-3.448v-.431m8.62-8.621h.432a3.448 3.448 0 0 1 3.448 3.448v.431m-3.88 8.621h.432a3.448 3.448 0 0 0 3.448-3.448v-.431M5.198 8.647S5.414 10.802 8 10.802s2.802-2.155 2.802-2.155"
        stroke={theme.color[color]}
        strokeWidth={1.4}
        strokeLinecap="round"
      />
      <rect x={5.858} y={5.902} width={0.8} height={0.8} rx={0.4} stroke={theme.color[color]} strokeWidth={0.8} />
      <rect x={9.258} y={5.902} width={0.8} height={0.8} rx={0.4} stroke={theme.color[color]} strokeWidth={0.8} />
    </svg>
  );
};
export default IcoFaceid16;
