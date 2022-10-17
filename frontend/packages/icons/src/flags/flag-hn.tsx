import React from 'react';

import type { FlagProps } from '../types';

const FlagHn = ({ className, testID }: FlagProps) => (
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
        fill="#F7FCFF"
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
      <g
        mask="url(#prefix__b)"
        fillRule="evenodd"
        clipRule="evenodd"
        fill="#4564F9"
      >
        <path d="M0 0v5h20V0H0zm0 10v5h20v-5H0zm10.511-1.793-.734.387.14-.818-.595-.64h.822l.367-.804.368.804h.821l-.594.64.14.818-.735-.387zm-3.75-1.25-.734.387.14-.818-.595-.64h.822l.367-.804.368.804h.821l-.594.64.14.818-.735-.387zm0 2.5-.734.387.14-.818-.595-.64h.822l.367-.804.368.804h.821l-.594.64.14.818-.735-.387zm7.5-2.5-.734.387.14-.818-.595-.64h.822l.367-.804.368.804h.821l-.594.64.14.818-.735-.387zm0 2.5-.734.387.14-.818-.595-.64h.822l.367-.804.368.804h.821l-.594.64.14.818-.735-.387z" />
      </g>
    </g>
  </svg>
);
export default FlagHn;
