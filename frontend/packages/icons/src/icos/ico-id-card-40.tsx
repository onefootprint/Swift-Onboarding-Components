import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoIdCard40 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M4.77 10.255c0-.5.405-.907.906-.907h28.648c.5 0 .907.406.907.907v19.48a.907.907 0 0 1-.907.908H21.207c-.533-1.726-1.337-3.551-2.352-5.011-.524-.754-1.174-1.51-1.945-2.076a5.395 5.395 0 1 0-5.279 0c-.77.566-1.421 1.322-1.945 2.076-1.015 1.46-1.82 3.285-2.352 5.01H5.676a.907.907 0 0 1-.907-.907v-19.48ZM16.58 27.212c.67.963 1.258 2.182 1.707 3.43h-8.035c.45-1.248 1.038-2.467 1.707-3.43.938-1.35 1.761-1.821 2.31-1.821.55 0 1.373.47 2.311 1.82ZM5.676 6.579A3.676 3.676 0 0 0 2 10.255v19.48a3.676 3.676 0 0 0 3.676 3.677h28.648A3.676 3.676 0 0 0 38 29.735v-19.48a3.676 3.676 0 0 0-3.676-3.676H5.676Zm5.969 12.27a2.626 2.626 0 1 1 5.252 0 2.626 2.626 0 0 1-5.252 0Zm14.657-3.103a1.385 1.385 0 1 0 0 2.77h3.438a1.385 1.385 0 1 0 0-2.77h-3.438Zm0 6.875a1.385 1.385 0 1 0 0 2.77h3.438a1.385 1.385 0 1 0 0-2.77h-3.438Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoIdCard40;
