import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoSsnCard24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M2.25 6.724c0-1.1.892-1.991 1.991-1.991H19.76c1.1 0 1.991.891 1.991 1.991v10.552c0 1.1-.892 1.991-1.991 1.991H4.24c-1.1 0-1.991-.891-1.991-1.991V6.724Zm1.991-.491a.491.491 0 0 0-.491.491v10.552c0 .271.22.491.491.491H19.76c.271 0 .491-.22.491-.491V6.724a.491.491 0 0 0-.491-.491H4.24Z"
        fill={theme.color[color]}
      />
      <path
        d="M5.167 14a1 1 0 0 1 1-1h.666a1 1 0 1 1 0 2h-.666a1 1 0 0 1-1-1ZM8.833 14a1 1 0 0 1 1-1h.667a1 1 0 1 1 0 2h-.667a1 1 0 0 1-1-1ZM12.5 14a1 1 0 0 1 1-1h.667a1 1 0 1 1 0 2H13.5a1 1 0 0 1-1-1ZM16.167 14a1 1 0 0 1 1-1h.666a1 1 0 1 1 0 2h-.666a1 1 0 0 1-1-1Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoSsnCard24;
