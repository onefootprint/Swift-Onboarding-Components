import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoFootprintShield40 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={40}
      height={40}
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
        d="M3 10.62 20 3l17 7.62S35.565 37 20 37 3 10.62 3 10.62Zm22.51 11.446h-2.755a3.444 3.444 0 0 0-3.444 3.444v2.754h-4.82V11.736h11.018v3.126a2.737 2.737 0 0 0-1.377-.371 2.755 2.755 0 1 0 1.377 5.137v2.438Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoFootprintShield40;
