import React from 'react';

import type { FlagProps } from '../types';

const FlagCl = ({ className, testID }: FlagProps) => (
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
      <path d="M0 0h9v9H0V0z" fill="#3D58DB" />
      <path d="M8.75-1.25H20v10H8.75v-10z" fill="#F7FCFF" />
      <path d="M0 8h20v7H0V8z" fill="#E31D1C" />
      <path
        d="m4.384 5.615-2.377 1.42L3.18 4.618l-2.078-1.57 2.399-.025.905-2.142.582 2.142 2.27.01L5.532 4.57l.896 2.465-2.044-1.42z"
        fill="#F7FCFF"
      />
    </g>
  </svg>
);
export default FlagCl;
