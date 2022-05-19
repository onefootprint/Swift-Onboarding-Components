import React from 'react';
import { useTheme } from 'styled';

import type { IconProps } from '../src/types';

const IcoChevronLeftBig16 = ({
  color = 'primary',
  style,
  testID,
}: IconProps) => {
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
        d="M10.426 3.5 5.58 8l4.846 4.5"
        stroke={theme.color[color]}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default IcoChevronLeftBig16;
