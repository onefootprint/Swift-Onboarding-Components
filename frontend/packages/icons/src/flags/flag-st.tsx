import React from 'react';

import type { FlagProps } from '../types';

const FlagSt = ({ className, testID }: FlagProps) => (
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
      <path d="M0 0v15h20V0H0z" fill="#FBCD17" />
      <path d="M0 0v5h20V0H0zm0 10v5h20v-5H0z" fill="#73BE4A" />
      <path d="M0 0v15l6.25-7.5L0 0z" fill="#C51918" />
      <path
        d="m10.626 8.67-1.169.705.267-1.377-.974-1.031 1.318-.056.558-1.286.558 1.286H12.5l-.971 1.087.292 1.377-1.195-.706zm5 0-1.169.705.267-1.377-.974-1.031 1.318-.056.558-1.286.558 1.286H17.5l-.971 1.087.292 1.377-1.195-.706z"
        fill="#272727"
      />
    </g>
  </svg>
);
export default FlagSt;
