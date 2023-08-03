import { useTheme } from '@onefootprint/styled';
import React from 'react';

import type { IconProps } from '../types';

const IcoFlask16 = ({ color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={17}
      height={17}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      className={className}
      aria-hidden="true"
    >
      <g clipPath="url(#prefix__a)">
        <path
          d="M6.39 2.499h5m-6.813 8h8.625m-5.812-8V5.42c0 .378-.108.748-.31 1.068L3.178 12.67c-.775 1.228.107 2.829 1.559 2.829h8.307c1.452 0 2.334-1.6 1.559-2.829l-3.904-6.182a2.003 2.003 0 0 1-.309-1.068V2.499"
          stroke={theme.color[color]}
          strokeWidth={1.4}
          strokeMiterlimit={10}
          strokeLinecap="round"
        />
      </g>
      <defs>
        <clipPath id="prefix__a">
          <path fill="#fff" transform="translate(.89 .999)" d="M0 0h16v16H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};
export default IcoFlask16;
