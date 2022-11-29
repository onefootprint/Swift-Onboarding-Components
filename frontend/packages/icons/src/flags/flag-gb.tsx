import React from 'react';

import type { FlagProps } from '../types';

const FlagGb = ({ className, testID }: FlagProps) => (
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
      <path fill="#F7FCFF" d="M0 0h20v15H0z" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11 0H8.5v6.25H0v2.5h8.5V15H11V8.75h9v-2.5h-9V0z"
        fill="#F50302"
      />
    </g>
  </svg>
);
export default FlagGb;
