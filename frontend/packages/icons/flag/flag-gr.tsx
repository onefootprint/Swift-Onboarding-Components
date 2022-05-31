import React from 'react';

import type { FlagProps } from '../src/types';

const FlagGr = ({ className, testID }: FlagProps) => (
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
        d="M0 0h20v15H0V0z"
        fill="#F7FCFF"
      />
      <path fill="#4564F9" d="M.017 3.438h20v1.875h-20z" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 0h20v1.875H0V0z"
        fill="#4564F9"
      />
      <path
        fill="#4564F9"
        d="M-.037 6.875h20V8.75h-20zM.07 10.25h20v1.875h-20zm-.007 3.188h20v1.875h-20z"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 0h10v8.75H0V0z"
        fill="#4564F9"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.044 0h1.978v3.438H10v2.366H6.022v3.571H4.044V5.804H0V3.437h4.044V0z"
        fill="#F7FCFF"
      />
    </g>
  </svg>
);

export default FlagGr;
