import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoEnter16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M13.475 2.002a.581.581 0 0 0-.06.014.466.466 0 0 0-.375.461v5.527c0 1.278-1.068 2.303-2.399 2.303H3.655l2.054-1.972a.445.445 0 0 0 .103-.54.483.483 0 0 0-.508-.251.492.492 0 0 0-.285.13l-2.803 2.705a.455.455 0 0 0-.165.173.212.212 0 0 0-.015.029v.014a.211.211 0 0 0-.015.029.464.464 0 0 0-.015.202v.042c.003.01.009.02.015.03v.014c.003.009.009.02.015.028.003.01.009.02.015.03v.014c.016.03.037.059.06.086a.223.223 0 0 0 .075.058l2.833 2.734a.5.5 0 0 0 .69 0 .454.454 0 0 0 0-.662l-2.054-1.972h6.986c1.85 0 3.359-1.448 3.359-3.224V2.477a.449.449 0 0 0-.15-.35.492.492 0 0 0-.375-.125Z"
        fill={theme.color[color]}
        stroke={theme.color[color]}
        strokeWidth={0.4}
      />
    </svg>
  );
};
export default IcoEnter16;
