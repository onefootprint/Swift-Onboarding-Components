import React from 'react';

import type { FlagProps } from '../types';

const FlagGf = ({ className, testID }: FlagProps) => (
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
      <path fill="#5EAA22" d="M0 0h20v15H0z" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="m0 0 20 15H0V0z"
        fill="#FECA00"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="m9.957 9.004-2.179 1.511.696-2.588-1.599-1.653 2.165-.09.917-2.559.916 2.56h2.162l-1.596 1.742.8 2.435-2.282-1.358z"
        fill="#E21835"
      />
    </g>
  </svg>
);
export default FlagGf;
