import React from 'react';

import type { FlagProps } from '../types';

const FlagGbSct = ({ className, testID }: FlagProps) => (
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
        fill="#0067C3"
      />
      <path d="m-.75 1 20 15 1.5-2-20-15-1.5 2z" fill="#fff" />
      <path d="m20.75 1-20 15-1.5-2 20-15 1.5 2z" fill="#fff" />
    </g>
  </svg>
);
export default FlagGbSct;
