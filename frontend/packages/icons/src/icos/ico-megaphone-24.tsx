import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoMegaphone24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M17.205 13.667a2.5 2.5 0 0 0 0-5m-4.725 8.541a2.501 2.501 0 0 1-4.858-.833v-1.25m.002-7.917v7.917m9.581-9.704v11.491a.833.833 0 0 1-1.079.796l-11.25-3.473a.833.833 0 0 1-.587-.796V8.895c0-.366.238-.689.587-.797l11.25-3.473a.833.833 0 0 1 1.08.796Z"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoMegaphone24;
