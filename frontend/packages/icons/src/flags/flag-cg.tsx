import React from 'react';

import type { FlagProps } from '../types';

const FlagCg = ({ className, testID }: FlagProps) => (
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
      <path d="M20 0v15H0L20 0z" fill="#FA1111" />
      <path d="M0 15V0h20L0 15z" fill="#07A907" />
      <path
        d="M18.432-3.625-.625 14.735l3.782 1.883L21.65-.133l-3.218-3.493z"
        fill="#FBCD17"
      />
    </g>
  </svg>
);
export default FlagCg;
