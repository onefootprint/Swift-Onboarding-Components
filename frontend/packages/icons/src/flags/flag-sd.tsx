import React from 'react';

import type { FlagProps } from '../types';

const FlagSd = ({ className, testID }: FlagProps) => (
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
      <path d="M0 0h20v15H0V0z" fill="#F7FCFF" />
      <path d="M0 0v5h20V0H0z" fill="#E31D1C" />
      <path d="M0 10v5h20v-5H0z" fill="#272727" />
      <path d="m0 0 10 7.5L0 15V0z" fill="#5EAA22" />
    </g>
  </svg>
);
export default FlagSd;
