import React from 'react';

import type { FlagProps } from '../src/types';

const FlagSo = ({ className, testID }: FlagProps) => (
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
      <path d="M0 0h20v15H0V0z" fill="#56C6F5" />
      <path
        d="m10.112 9.198-2.353 1.496.79-2.618L6.87 6.365l2.314-.05 1.023-2.585.933 2.619 2.308.04-1.735 1.742.81 2.49-2.411-1.423z"
        fill="#F7FCFF"
      />
    </g>
  </svg>
);

export default FlagSo;
