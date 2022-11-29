import React from 'react';

import type { FlagProps } from '../types';

const FlagSr = ({ className, testID }: FlagProps) => (
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
        fill="#4E8B1D"
      />
      <path
        d="M0 4.063h-.938v6.875h21.876V4.062H0z"
        fill="#AF0100"
        stroke="#fff"
        strokeWidth={1.875}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.002 9.059 8.441 10l.356-1.836L7.5 6.789l1.758-.074L10.002 5l.743 1.715H12.5l-1.295 1.449.39 1.836L10 9.059z"
        fill="#FECA00"
      />
    </g>
  </svg>
);
export default FlagSr;
