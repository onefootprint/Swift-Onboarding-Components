import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoSquareFrame16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.967 2.967a1.937 1.937 0 0 1 1.37-.567h7.329a1.937 1.937 0 0 1 1.936 1.937v7.329a1.937 1.937 0 0 1-1.937 1.936H4.337A1.937 1.937 0 0 1 2.4 11.665V4.337c0-.514.204-1.007.567-1.37ZM4.337 1.1A3.237 3.237 0 0 0 1.1 4.337v7.329a3.237 3.237 0 0 0 3.237 3.236h7.329a3.237 3.237 0 0 0 3.236-3.236v-7.33A3.237 3.237 0 0 0 11.666 1.1h-7.33Zm.862 2.587a1.512 1.512 0 0 0-1.512 1.512v1.293a.65.65 0 0 0 1.3 0V5.2a.212.212 0 0 1 .212-.212h1.293a.65.65 0 0 0 0-1.3H5.2Zm4.31 0a.65.65 0 0 0 0 1.3h1.294a.212.212 0 0 1 .212.212v1.293a.65.65 0 1 0 1.3 0V5.2a1.512 1.512 0 0 0-1.512-1.512H9.51ZM4.988 9.51a.65.65 0 1 0-1.3 0v1.293a1.512 1.512 0 0 0 1.512 1.512h1.293a.65.65 0 1 0 0-1.3H5.2a.212.212 0 0 1-.212-.212V9.51Zm7.329 0a.65.65 0 1 0-1.3 0v1.293a.212.212 0 0 1-.213.212H9.51a.65.65 0 1 0 0 1.3h1.293a1.512 1.512 0 0 0 1.512-1.512V9.51Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoSquareFrame16;
