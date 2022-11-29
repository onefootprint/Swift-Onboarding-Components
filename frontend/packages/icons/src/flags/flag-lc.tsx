import React from 'react';

import type { FlagProps } from '../types';

const FlagLc = ({ className, testID }: FlagProps) => (
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
      <path d="M0 0h20v15H0V0z" fill="#7CCFF5" />
      <path d="m10 2.5 5 10H5l5-10z" fill="#F7FCFF" />
      <path d="m10 5 4.375 7.5h-8.75L10 5z" fill="#272727" />
      <path d="m10 8.75 5 3.75H5l5-3.75z" fill="#FECA00" />
    </g>
  </svg>
);
export default FlagLc;
