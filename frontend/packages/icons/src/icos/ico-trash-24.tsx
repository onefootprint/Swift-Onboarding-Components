import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoTrash24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M4.292 6.167a.625.625 0 0 0 0 1.25v-1.25Zm15.416 1.25a.625.625 0 0 0 0-1.25v1.25Zm-8.958 3.541a.625.625 0 1 0-1.25 0h1.25ZM9.5 15.542a.625.625 0 1 0 1.25 0H9.5Zm5-4.584a.625.625 0 1 0-1.25 0h1.25Zm-1.25 4.584a.625.625 0 0 0 1.25 0h-1.25Zm1.373-8.595a.625.625 0 1 0 1.21-.311l-1.21.311Zm-9.289-.115.783 12.137 1.248-.08L6.582 6.75l-1.248.08Zm2.239 13.501h8.854v-1.25H7.573v1.25Zm10.31-1.364.782-12.137-1.247-.08-.783 12.136 1.247.08Zm.159-12.802H5.957v1.25h12.083v-1.25Zm-13.75 1.25h1.666v-1.25H4.291v1.25Zm13.75 0h1.666v-1.25h-1.666v1.25Zm-1.615 12.916c.769 0 1.406-.597 1.455-1.364l-1.247-.08a.208.208 0 0 1-.208.194v1.25ZM6.117 18.97c.05.767.687 1.364 1.456 1.364v-1.25c-.11 0-.201-.085-.208-.195l-1.248.08Zm3.383-8.01v4.583h1.25v-4.584H9.5Zm3.75 0v4.583h1.25v-4.584h-1.25ZM12 4.916a2.71 2.71 0 0 1 2.623 2.03l1.21-.311A3.96 3.96 0 0 0 12 3.666v1.25Zm-2.623 2.03A2.71 2.71 0 0 1 12 4.917v-1.25a3.96 3.96 0 0 0-3.834 2.969l1.21.311Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoTrash24;
