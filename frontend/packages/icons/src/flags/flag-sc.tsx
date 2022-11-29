import React from 'react';

import type { FlagProps } from '../types';

const FlagSc = ({ className, testID }: FlagProps) => (
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
        d="M0 0v15h20V0H0z"
        fill="#2E42A5"
      />
      <mask
        id="prefix__b"
        maskUnits="userSpaceOnUse"
        x={0}
        y={0}
        width={20}
        height={15}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 0v15h20V0H0z"
          fill="#fff"
        />
      </mask>
      <g mask="url(#prefix__b)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 14.998 10.094-1.25H20.19L0 14.998z"
          fill="#FFD018"
        />
        <path d="m0 14.998 21.54-8.124V-3.19L0 14.998z" fill="#E31D1C" />
        <path d="m0 14.998 21.54-3.124V6.81L0 14.998z" fill="#F7FCFF" />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 14.998h21.54V10.56L0 14.998z"
          fill="#5EAA22"
        />
      </g>
    </g>
  </svg>
);
export default FlagSc;
