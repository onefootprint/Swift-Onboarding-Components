import React from 'react';
import { useTheme } from 'styled';

import type { IconProps } from '../src/types';

const IcoCrosshair16 = ({ color = 'primary', style, testID }: IconProps) => {
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
        d="M7.998 1.96a.6.6 0 0 1 .6.6v.184a5.29 5.29 0 0 1 4.653 4.654h.184a.6.6 0 1 1 0 1.2h-.184a5.29 5.29 0 0 1-4.653 4.653v.184a.6.6 0 1 1-1.2 0v-.184a5.29 5.29 0 0 1-4.654-4.653H2.56a.6.6 0 0 1 0-1.2h.184a5.29 5.29 0 0 1 4.654-4.654V2.56a.6.6 0 0 1 .6-.6ZM3.954 8.598h1.981a.6.6 0 0 0 0-1.2H3.954a4.09 4.09 0 0 1 3.444-3.444v1.981a.6.6 0 0 0 1.2 0V3.954a4.09 4.09 0 0 1 3.443 3.444H10.06a.6.6 0 0 0 0 1.2h1.981a4.09 4.09 0 0 1-3.443 3.443V10.06a.6.6 0 0 0-1.2 0v1.981a4.09 4.09 0 0 1-3.444-3.443Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};

export default IcoCrosshair16;
