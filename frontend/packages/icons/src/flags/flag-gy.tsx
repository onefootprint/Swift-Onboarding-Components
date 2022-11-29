import React from 'react';

import type { FlagProps } from '../types';

const FlagGy = ({ className, testID }: FlagProps) => (
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
        fill="#5EAA22"
      />
      <path
        d="M.625 14.117V.883L19.372 7.5.625 14.117z"
        fill="#FECA00"
        stroke="#F7FCFF"
        strokeWidth={1.25}
      />
      <path
        d="M-.625 14.972V.028L8.982 7.5l-9.607 7.472z"
        fill="#E11C1B"
        stroke="#272727"
        strokeWidth={1.25}
      />
    </g>
  </svg>
);
export default FlagGy;
