import { useTheme } from '@onefootprint/styled';
import React from 'react';

import type { IconProps } from '../types';

const IcoQuestionMark16 = ({
  color = 'primary',
  className,
  testID,
}: IconProps) => {
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
          d="M6.622 5.553a2.015 2.015 0 0 1 2.932-.78 2.017 2.017 0 0 1 .291 3.113c-.448.442-.993.92-1.257 1.48m-.158 2.687v.008m0 2.681a6.5 6.5 0 1 1 0-12.998 6.5 6.5 0 0 1 0 12.998Z"
          stroke={theme.color[color]}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="prefix__a">
          <path fill="#fff" transform="translate(.43 .242)" d="M0 0h16v16H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};
export default IcoQuestionMark16;
