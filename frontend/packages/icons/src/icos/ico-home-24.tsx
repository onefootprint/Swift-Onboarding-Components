import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoHome24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M5.125 9.715c0-.232 0-.348.03-.455a.833.833 0 0 1 .125-.266c.064-.09.154-.164.334-.31l5.542-4.535c.3-.246.45-.369.618-.416a.833.833 0 0 1 .452 0c.167.047.317.17.618.416l5.542 4.534c.18.147.27.22.334.311.057.08.1.17.126.266.029.107.029.223.029.455v7.827c0 .466 0 .7-.09.878a.833.833 0 0 1-.365.364c-.178.091-.412.091-.878.091H6.458c-.466 0-.7 0-.878-.09a.833.833 0 0 1-.364-.365c-.091-.178-.091-.412-.091-.878V9.715Z"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoHome24;
