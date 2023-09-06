import React from 'react';

import type { FlagProps } from '../types';

const FlagBd = ({ className, testID }: FlagProps) => (
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
      <path fill="#38A17E" d="M0 0h20v15H0z" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.5 11.25a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5z"
        fill="#F72E45"
      />
    </g>
  </svg>
);
export default FlagBd;
