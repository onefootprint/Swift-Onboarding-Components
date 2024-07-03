import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoIdGeneric40 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={40}
      height={40}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
      data-colored={false}
    >
      <rect x={5} y={5} width={30} height={30} rx={5} stroke={theme.color[color]} strokeWidth={3} />
      <path
        d="M10 12.429c0-.79.995-1.429 2.222-1.429h15.556c1.227 0 2.222.64 2.222 1.429v2.142c0 .79-.995 1.429-2.222 1.429H12.222C10.995 16 10 15.36 10 14.571V12.43Z"
        fill={theme.color[color]}
      />
      <rect x={17} y={19} width={12} height={2.4} rx={1.2} fill={theme.color[color]} />
    </svg>
  );
};
export default IcoIdGeneric40;
