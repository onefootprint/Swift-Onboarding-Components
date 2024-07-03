import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoAlpaca24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="m9.575 19.788.633-6.764h-.057c-.507 0-.927-.184-1.313-.518a2.173 2.173 0 0 1-.723-1.304l1.196-.785v-.01c0-.534.203-1.048.568-1.434a2.031 2.031 0 0 1 1.388-.638v-.002h.355V7.07c.252 0 .496.09.689.255.192.166.32.395.363.647h.015V7.07c.19 0 .375.051.539.148a1.096 1.096 0 0 1 .371 1.498c.321.214.585.504.767.847.183.342.278.726.278 1.115v8.164c0 .12.047.235.13.319a.441.441 0 0 0 .315.132h.527c-.74.381-1.547.65-2.398.781C17.058 19.48 20 16.112 20 12.05c0-4.484-3.582-8.119-8-8.119s-8 3.635-8 8.119c0 3.626 2.342 6.697 5.575 7.739Zm.94-9.172a.25.25 0 0 0-.07.175l-.023.248h.489c.13 0 .254-.052.345-.145a.5.5 0 0 0 .144-.351h-.712a.243.243 0 0 0-.172.073Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoAlpaca24;
