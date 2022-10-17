import React from 'react';

import type { FlagProps } from '../types';

const FlagTg = ({ className, testID }: FlagProps) => (
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
    <g mask="url(#prefix__a)">
      <path
        d="M0-.625h-.625v16.25h21.25V-.625H0z"
        fill="#5EAA22"
        stroke="#F7FCFF"
        strokeWidth={1.25}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 3.75v2.5h20v-2.5H0zm0 5v2.5h20v-2.5H0z"
        fill="#FECA00"
      />
      <path fill="#F50101" d="M0 0h10v8.75H0z" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.156 6.34 2.832 7.78l.902-2.415-1.859-1.627h2.28l1.001-2.406.764 2.406h2.253L6.59 5.364l.778 2.296-2.213-1.32z"
        fill="#F7FCFF"
      />
    </g>
  </svg>
);
export default FlagTg;
