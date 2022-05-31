import React from 'react';

import type { FlagProps } from '../src/types';

const FlagCw = ({ className, testID }: FlagProps) => (
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
        fill="#2E42A5"
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
        <path
          d="M2.659 3.843 1.416 4.5l.6-1.167-.766-.855.952-.035.457-1.192.349 1.192 1.114.035-.802.855.509 1.167-1.17-.656zm4.436 3.08-1.534.642.602-1.61-1.334-1.08h1.598l.668-1.742.51 1.742h1.6l-1.137 1.08.565 1.61-1.538-.642z"
          fill="#F7FCFF"
        />
        <path d="M0 8.75v2.5h20v-2.5H0z" fill="#F9E813" />
      </g>
    </g>
  </svg>
);

export default FlagCw;
