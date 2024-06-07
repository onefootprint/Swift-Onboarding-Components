import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoUser40 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15.286 12.351a4.711 4.711 0 1 1 9.423 0 4.711 4.711 0 0 1-9.423 0Zm4.711-7.711a7.711 7.711 0 1 0 0 15.423 7.711 7.711 0 0 0 0-15.423ZM8.632 30.746c.642-1.215 1.693-2.55 3.435-3.59 1.743-1.041 4.266-1.838 7.93-1.838 3.665 0 6.188.797 7.93 1.837 1.743 1.04 2.794 2.376 3.436 3.591.215.408.147.72-.069.992-.256.322-.773.614-1.45.614H10.15c-.676 0-1.193-.292-1.45-.614-.216-.271-.283-.584-.068-.992Zm11.365-8.428c-4.11 0-7.183.898-9.468 2.261-2.285 1.365-3.692 3.143-4.55 4.766-.804 1.522-.54 3.113.375 4.262.875 1.1 2.29 1.745 3.796 1.745h19.695c1.506 0 2.92-.646 3.796-1.745.915-1.15 1.178-2.74.374-4.262-.857-1.623-2.264-3.401-4.55-4.765-2.284-1.364-5.358-2.262-9.468-2.262Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoUser40;
