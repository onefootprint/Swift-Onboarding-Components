import React from 'react';

import type { FlagProps } from '../types';

const FlagVc = ({ className, testID }: FlagProps) => (
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
      <path d="M5 0h10v15H5V0z" fill="#FFDC17" />
      <path d="M15 0h5v15h-5V0z" fill="#5FBF2B" />
      <path d="M0 0h5v15H0V0z" fill="#2E42A5" />
      <path
        d="m12.329 3.125-1.9 2.79 1.9 2.69 1.9-2.69-1.9-2.79zm-4.656.05-2.048 2.74 1.9 2.64 1.9-2.64-1.752-2.74zm.354 5.818 2.048-2.74 1.752 2.74-1.752 2.82-2.048-2.82z"
        fill="#5FBF2B"
      />
    </g>
  </svg>
);
export default FlagVc;
