import React from 'react';

import type { FlagProps } from '../types';

const FlagTh = ({ className, testID }: FlagProps) => (
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
    <g mask="url(#prefix__a)">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 10h20v5H0v-5zM0 0h20v3.75H0V0z"
        fill="#F50101"
      />
      <path
        d="M0 4.063h-.938v6.875h21.876V4.062H0z"
        fill="#3D58DB"
        stroke="#fff"
        strokeWidth={1.875}
      />
    </g>
  </svg>
);
export default FlagTh;
