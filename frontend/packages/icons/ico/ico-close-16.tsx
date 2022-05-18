import React from 'react';
import { useTheme } from 'styled';

import type { IconProps } from '../src/types';

const IcoClose16 = ({ color = 'primary', style, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={16}
      height={16}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      style={style}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.797 4.26a.75.75 0 0 0-1.06-1.06L7.997 6.938 4.26 3.2A.75.75 0 1 0 3.2 4.26l3.738 3.738L3.2 11.736a.75.75 0 0 0 1.06 1.06L7.998 9.06l3.738 3.738a.75.75 0 1 0 1.06-1.06L9.06 7.997l3.738-3.738Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};

export default IcoClose16;
