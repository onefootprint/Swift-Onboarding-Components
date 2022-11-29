import React from 'react';

import type { FlagProps } from '../types';

const FlagGm = ({ className, testID }: FlagProps) => (
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
        d="M0 10h20v5H0v-5z"
        fill="#5EAA22"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 0h20v5H0V0z"
        fill="#E31D1C"
      />
      <path
        d="M0 5.25h-.75v4.5h21.5v-4.5H0z"
        fill="#3D58DB"
        stroke="#fff"
        strokeWidth={1.5}
      />
    </g>
  </svg>
);
export default FlagGm;
