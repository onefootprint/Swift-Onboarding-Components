import React from 'react';

import type { FlagProps } from '../types';

const FlagAe = ({ className, testID }: FlagProps) => (
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
        fill="#F7FCFF"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 0v5h20V0H0z"
        fill="#5EAA22"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 10v5h20v-5H0z"
        fill="#272727"
      />
      <path fill="#E31D1C" d="M0 0h6v15H0z" />
    </g>
  </svg>
);
export default FlagAe;
