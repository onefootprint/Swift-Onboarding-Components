import React from 'react';

import type { FlagProps } from '../types';

const FlagQa = ({ className, testID }: FlagProps) => (
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
      <path fill="#B61C49" d="M0 0h20v15H0z" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 0h4.25L7.5 1.25 4.25 2.5 7.5 3.75 4.25 5 7.5 6.25 4.25 7.5 7.5 8.75 4.25 10l3.25 1.25-3.25 1.25 3.25 1.25L4.25 15H0V0z"
        fill="#F7FCFF"
      />
    </g>
  </svg>
);
export default FlagQa;
