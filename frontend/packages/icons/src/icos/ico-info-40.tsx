import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoInfo40 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M7.25 20c0-7.042 5.708-12.75 12.75-12.75 7.04 0 12.748 5.708 12.748 12.75 0 7.04-5.707 12.748-12.749 12.748C12.958 32.748 7.25 27.041 7.25 20ZM20 4.25C11.3 4.25 4.25 11.301 4.25 20c0 8.697 7.051 15.748 15.75 15.748 8.697 0 15.748-7.05 15.748-15.749 0-8.698-7.05-15.749-15.749-15.749Zm-.084 9.702a.066.066 0 1 0 0 .133.066.066 0 0 0 0-.133Zm-1.733.067a1.733 1.733 0 1 1 3.466 0 1.733 1.733 0 0 1-3.466 0Zm1.816 6.696c.69 0 1.25.56 1.25 1.25v3.93a1.25 1.25 0 0 1-2.5 0v-3.93c0-.69.56-1.25 1.25-1.25Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoInfo40;
