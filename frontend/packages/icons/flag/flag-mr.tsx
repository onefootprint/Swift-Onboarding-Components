import React from 'react';

import type { FlagProps } from '../src/types';

const FlagMr = ({ className, testID }: FlagProps) => (
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
        fill="#1C7B4D"
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
      <g mask="url(#prefix__b)" fillRule="evenodd" clipRule="evenodd">
        <path d="M0 0v3.75h20V0H0zm0 11.25V15h20v-3.75H0z" fill="#E31D1C" />
        <path
          d="M10.151 8.987a4.276 4.276 0 0 0 4.154-2.696c-.184 2.321-1.468 3.896-4.154 3.896S6.48 8.147 5.998 6.113c0 0 .912 2.856 4.153 2.874z"
          fill="#FECA00"
        />
        <path
          d="m11.023 6.134.21 1.227-1.101-.58-1.103.58.211-1.227-.892-.96h1.233l.55-1.205.552 1.206h1.232l-.892.959z"
          fill="#FECA00"
        />
      </g>
    </g>
  </svg>
);

export default FlagMr;
