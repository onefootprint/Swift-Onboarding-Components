import React from 'react';

import type { FlagProps } from '../types';

const FlagTo = ({ className, testID }: FlagProps) => (
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
        fill="#E31D1C"
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
      <g mask="url(#prefix__b)">
        <path fill="#F7FCFF" d="M0 0h11.25v10H0z" />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M7.5 1.25H5v2.5H2.5v2.5H5v2.5h2.5v-2.5H10v-2.5H7.5v-2.5z"
          fill="#E31D1C"
        />
      </g>
    </g>
  </svg>
);
export default FlagTo;
