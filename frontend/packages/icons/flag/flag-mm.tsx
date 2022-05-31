import React from 'react';

import type { FlagProps } from '../src/types';

const FlagMm = ({ className, testID }: FlagProps) => (
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
      <path d="M0 10h20v5H0v-5z" fill="#E31D1C" />
      <path d="M0 5h20v5H0V5z" fill="#5EAA22" />
      <path d="M0 0h20v5H0V0z" fill="#FFD018" />
      <path
        d="m10.039 9.985-3.22 2.046L7.9 8.448l-2.296-2.34 3.166-.07 1.4-3.537 1.277 3.584 3.158.055-2.373 2.384 1.108 3.409-3.3-1.948z"
        fill="#F7FCFF"
      />
    </g>
  </svg>
);

export default FlagMm;
