import React from 'react';

import type { FlagProps } from '../types';

const FlagMg = ({ className, testID }: FlagProps) => (
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
      <path d="M7 7.5h13V15H7V7.5z" fill="#78D843" />
      <path d="M7 0h13v7.5H7V0z" fill="#EA1A1A" />
      <path d="M0 0h8v15H0V0z" fill="#F7FCFF" />
    </g>
  </svg>
);
export default FlagMg;
