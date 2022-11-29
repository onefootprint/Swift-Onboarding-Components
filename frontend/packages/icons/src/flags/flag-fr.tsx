import React from 'react';

import type { FlagProps } from '../types';

const FlagFr = ({ className, testID }: FlagProps) => (
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
      <path d="M14 0h6v15h-6V0z" fill="#F50100" />
      <path d="M0 0h7v15H0V0z" fill="#2E42A5" />
      <path d="M6 0h8v15H6V0z" fill="#F7FCFF" />
    </g>
  </svg>
);
export default FlagFr;
