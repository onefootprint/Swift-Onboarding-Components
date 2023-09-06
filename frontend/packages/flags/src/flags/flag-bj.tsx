import React from 'react';

import type { FlagProps } from '../types';

const FlagBj = ({ className, testID }: FlagProps) => (
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
        fill="#DD2C2B"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 0v7.5h20V0H0z"
        fill="#FECA00"
      />
      <path fill="#5EAA22" d="M0 0h9v15H0z" />
    </g>
  </svg>
);
export default FlagBj;
