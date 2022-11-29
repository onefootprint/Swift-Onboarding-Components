import React from 'react';

import type { FlagProps } from '../types';

const FlagLv = ({ className, testID }: FlagProps) => (
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
      <path d="M0 9h20v6H0V9z" fill="#C51918" />
      <path d="M0 5h20v3.75H0V5z" fill="#F7FCFF" />
      <path d="M0 0h20v6H0V0z" fill="#C51918" />
    </g>
  </svg>
);
export default FlagLv;
