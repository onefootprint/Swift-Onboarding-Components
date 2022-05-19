import React from 'react';
import { useTheme } from 'styled';

import type { IconProps } from '../src/types';

const IcoUserCircle16 = ({ color = 'primary', style, testID }: IconProps) => {
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
        d="M7.996 1.81a6.186 6.186 0 0 0-4.772 10.123 6.62 6.62 0 0 1 4.772-2.025c1.874 0 3.567.778 4.773 2.025A6.186 6.186 0 0 0 7.997 1.81Zm3.765 11.095a5.22 5.22 0 0 0-3.765-1.597 5.22 5.22 0 0 0-3.765 1.598 6.16 6.16 0 0 0 3.765 1.277 6.16 6.16 0 0 0 3.765-1.277ZM.41 7.997a7.586 7.586 0 1 1 15.173 0 7.586 7.586 0 0 1-15.173 0ZM7.996 4.66a1.437 1.437 0 1 0 0 2.874 1.437 1.437 0 0 0 0-2.874ZM5.16 6.097a2.837 2.837 0 1 1 5.675 0 2.837 2.837 0 0 1-5.675 0Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};

export default IcoUserCircle16;
