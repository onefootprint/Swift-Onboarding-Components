import React from 'react';

import type { FlagProps } from '../types';

const FlagGw = ({ className, testID }: FlagProps) => (
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
      <path d="M10 0h10v7.5H10V0z" fill="#FBCD17" />
      <path d="M10 7.5h10V15H10V7.5z" fill="#0B9E7A" />
      <path d="M0 0h10v15H0V0z" fill="#E11C1B" />
      <path
        d="M5.582 9.129 3.403 10.64 4.1 8.052 2.5 6.399l2.165-.09.917-2.559.916 2.56H8.66L7.064 8.051l.8 2.435L5.581 9.13z"
        fill="#1D1D1D"
      />
    </g>
  </svg>
);
export default FlagGw;
