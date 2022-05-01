import React from 'react';
import { useTheme } from 'styled';

import type { IconProps } from '../src/types';

const IcoCheckCircle16 = ({ color = 'primary', style, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={16}
      height={16}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      style={style}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.007 1.5a6.507 6.507 0 1 0 0 13.015 6.507 6.507 0 0 0 0-13.015ZM2.7 8.007a5.307 5.307 0 1 1 10.615 0 5.307 5.307 0 0 1-10.615 0Zm7.661-1.534a.6.6 0 0 0-1.04-.598L7.45 9.133a.215.215 0 0 1-.38-.016l-.354-.753a.6.6 0 0 0-1.086.51l.353.753c.487 1.036 1.939 1.096 2.508.103l1.87-3.257Z"
        fill={theme.colors[color]}
      />
    </svg>
  );
};

export default IcoCheckCircle16;
