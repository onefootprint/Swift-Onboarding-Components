import React from 'react';

import type { FlagProps } from '../types';

const FlagTz = ({ className, testID }: FlagProps) => (
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
        fill="#3195F9"
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
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 0v15L20 0H0z"
          fill="#73BE4A"
        />
        <path
          d="m-1.139 15.9.434.65.65-.434L22.608.988l.65-.433-.434-.65-1.388-2.08-.433-.65-.65.434L-2.31 12.737l-.65.433.434.65 1.387 2.08z"
          fill="#272727"
          stroke="#FFD018"
          strokeWidth={1.563}
        />
      </g>
    </g>
  </svg>
);
export default FlagTz;
