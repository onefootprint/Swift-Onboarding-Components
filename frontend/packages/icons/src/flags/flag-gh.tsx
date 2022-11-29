import React from 'react';

import type { FlagProps } from '../types';

const FlagGh = ({ className, testID }: FlagProps) => (
  <svg
    width={20}
    height={15}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    data-testid={testID}
    className={className}
    aria-hidden="true"
  >
    <mask
      id="prefix__a"
      maskUnits="userSpaceOnUse"
      x={0}
      y={0}
      width={20}
      height={15}
    >
      <path fill="#fff" d="M0 0h20v15H0z" />
    </mask>
    <g mask="url(#prefix__a)" fillRule="evenodd" clipRule="evenodd">
      <path d="M0 10h20v5H0v-5z" fill="#5EAA22" />
      <path d="M0 5h20v5H0V5z" fill="#FECA00" />
      <path d="M0 0h20v5H0V0z" fill="#E11C1B" />
      <path
        opacity={0.9}
        d="m10.047 9.057-2.178 1.51.696-2.588-1.6-1.653 2.166-.09.916-2.558.916 2.559h2.162L11.53 7.979l.799 2.436-2.282-1.358z"
        fill="#1D1D1D"
      />
    </g>
  </svg>
);
export default FlagGh;
