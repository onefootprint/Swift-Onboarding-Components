import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoUser16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      viewBox="0 0 16 16"
    >
      <g clipPath="url(#prefix__a)" stroke={theme.color[color]} strokeWidth={1.5} strokeLinejoin="round">
        <path d="M10.499 4.333a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0ZM8 8.833c-2.531 0-4.378 1.683-4.886 3.944-.087.383.225.723.617.723h8.536c.393 0 .704-.34.618-.723-.508-2.261-2.355-3.944-4.886-3.944Z" />
      </g>
      <defs>
        <clipPath id="prefix__a">
          <path fill="#fff" d="M0 0h16v16H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};
export default IcoUser16;
