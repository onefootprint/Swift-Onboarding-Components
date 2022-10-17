import React from 'react';

import type { FlagProps } from '../types';

const FlagRo = ({ className, testID }: FlagProps) => (
  <svg
    width={20}
    height={15}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
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
      <path d="M6.25 0h7.5v15h-7.5V0z" fill="#FBCD17" />
      <path d="M13.75 0H20v15h-6.25V0z" fill="#E11C1B" />
      <path d="M0 0h6.25v15H0V0z" fill="#2E42A5" />
    </g>
  </svg>
);
export default FlagRo;
