import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoFootprintShield16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={16}
      height={16}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
      data-colored={false}
    >
      <g clipPath="url(#prefix__a)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M.5 3.862 8 .5l7.5 3.362S14.867 15.5 8 15.5.5 3.862.5 3.862Zm9.833 5.013H9.167c-.806 0-1.459.653-1.459 1.459V11.5H5.667v-7h4.666v1.324a1.167 1.167 0 1 0 0 2.019v1.032Z"
          fill={theme.color[color]}
        />
      </g>
      <defs>
        <clipPath id="prefix__a">
          <path fill="#fff" d="M0 0h16v16H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};
export default IcoFootprintShield16;
