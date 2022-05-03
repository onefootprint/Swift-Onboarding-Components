import React from 'react';
import { useTheme } from 'styled';

import type { IconProps } from '../src/types';

const IcoEmail16 = ({ color = 'primary', style, testID }: IconProps) => {
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
        d="M3.655 2.23A2.255 2.255 0 0 0 1.4 4.485v7.035a2.255 2.255 0 0 0 2.255 2.255h8.69A2.255 2.255 0 0 0 14.6 11.52V4.485a2.255 2.255 0 0 0-2.255-2.255h-8.69Zm-.141 1.21c.046-.007.093-.01.141-.01h8.69c.048 0 .095.003.141.01L8 7.407 3.514 3.44Zm-.889.816a1.06 1.06 0 0 0-.025.23v7.034c0 .582.472 1.055 1.055 1.055h8.69c.583 0 1.055-.473 1.055-1.055V4.485c0-.079-.009-.155-.025-.23L8.398 8.66a.6.6 0 0 1-.796 0L2.625 4.256Z"
        fill={theme.colors[color]}
      />
    </svg>
  );
};

export default IcoEmail16;
