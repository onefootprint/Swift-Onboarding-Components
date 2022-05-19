import React from 'react';
import { useTheme } from 'styled';

import type { IconProps } from '../src/types';

const IcoLogOut16 = ({ color = 'primary', style, testID }: IconProps) => {
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
        d="M2.965.35A2.615 2.615 0 0 0 .35 2.965V13.02a2.615 2.615 0 0 0 2.615 2.616h8.14a.7.7 0 1 0 0-1.4h-8.14A1.215 1.215 0 0 1 1.75 13.02V2.965c0-.67.544-1.215 1.215-1.215h8.14a.7.7 0 1 0 0-1.4h-8.14Zm8.106 4.054a.7.7 0 0 1 .99-.036l3.35 3.112a.7.7 0 0 1 0 1.026l-3.35 3.112a.7.7 0 1 1-.953-1.026l2.045-1.9H6.796a.7.7 0 1 1 0-1.4h6.357l-2.045-1.899a.7.7 0 0 1-.037-.989Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};

export default IcoLogOut16;
