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
        d="M12.868 4.331a.85.85 0 1 0-1.203-1.202L7.998 6.796 4.331 3.13A.85.85 0 0 0 3.129 4.33l3.667 3.667-3.667 3.667a.85.85 0 0 0 1.202 1.203L7.998 9.2l3.667 3.668a.85.85 0 0 0 1.203-1.203L9.2 7.998l3.668-3.667Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};

export default IcoClose16;
