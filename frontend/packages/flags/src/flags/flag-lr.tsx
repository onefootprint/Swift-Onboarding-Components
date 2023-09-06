import React from 'react';

import type { FlagProps } from '../types';

const FlagLr = ({ className, testID }: FlagProps) => (
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
        d="M0 0h20v15H0V0z"
        fill="#F7FCFF"
      />
      <path fill="#E31D1C" d="M.017 3.438h20v1.875h-20z" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 0h20v1.875H0V0z"
        fill="#E31D1C"
      />
      <path
        fill="#E31D1C"
        d="M-.037 6.875h20V8.75h-20zM.07 10.25h20v1.875h-20zm-.007 3.188h20v1.875h-20z"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 0h10v8.75H0V0z"
        fill="#3D58DB"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.083 5.758 3.257 7.025l.583-2.17L2.5 3.47l1.815-.075.768-2.145.768 2.145h1.811l-1.337 1.46.67 2.042-1.912-1.139z"
        fill="#F7FCFF"
      />
    </g>
  </svg>
);
export default FlagLr;
