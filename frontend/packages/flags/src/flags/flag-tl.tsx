import React from 'react';

import type { FlagProps } from '../types';

const FlagTl = ({ className, testID }: FlagProps) => (
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
        d="M0-.625h-.625v16.25h21.25V-.625H0z"
        fill="#E31D1C"
        stroke="#F7FCFF"
        strokeWidth={1.25}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="m0 0 15 7.5L0 15V0z"
        fill="#FECA00"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="m0 0 10 7.5L0 15V0z"
        fill="#272727"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="m4.155 9.005-1.262 1.313-.132-1.866-1.61-.992 1.679-.526.274-1.85L4.267 6.55l1.695-.454-.877 1.734.852 1.673-1.782-.497z"
        fill="#F7FCFF"
      />
    </g>
  </svg>
);
export default FlagTl;
