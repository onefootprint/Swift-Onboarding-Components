import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoApex24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      <circle cx={16.959} cy={16.592} r={1.532} fill={theme.color[color]} />
      <rect
        x={13.894}
        y={10.082}
        width={3.064}
        height={8.042}
        rx={1.532}
        transform="rotate(27 13.894 10.082)"
        fill={theme.color[color]}
      />
      <rect
        x={11.418}
        y={5.333}
        width={3.064}
        height={13.403}
        rx={1.532}
        transform="rotate(27 11.418 5.333)"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoApex24;
