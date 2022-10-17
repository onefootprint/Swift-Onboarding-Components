import React from 'react';

import type { FlagProps } from '../types';

const FlagTn = ({ className, testID }: FlagProps) => (
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
      <g mask="url(#prefix__b)" fillRule="evenodd" clipRule="evenodd">
        <path d="M10 12.5a5 5 0 1 0 0-10 5 5 0 0 0 0 10z" fill="#F7FCFF" />
        <path
          d="M10.877 11.032s-2.636-.72-2.636-3.549c0-2.829 2.636-3.61 2.636-3.61-1.09-.421-4.279.226-4.279 3.61 0 3.385 3.278 3.994 4.279 3.549zm-.145-4.164-1.308.477 1.405.492.048 1.315.855-1.022 1.41.1-1.016-.829.612-1.197-1.195.403-.828-1.035.017 1.296z"
          fill="#E31D1C"
        />
      </g>
    </g>
  </svg>
);
export default FlagTn;
