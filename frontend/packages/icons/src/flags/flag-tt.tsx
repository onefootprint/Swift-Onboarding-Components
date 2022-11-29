import React from 'react';

import type { FlagProps } from '../types';

const FlagTt = ({ className, testID }: FlagProps) => (
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
        <path
          d="m18.468 18.426-.332.271-.292-.312-18.965-20.25-.335-.357.38-.31L.857-4.113l.332-.27.292.311 18.965 20.25.335.357-.38.31-1.934 1.582z"
          fill="#272727"
          stroke="#F7FCFF"
          strokeWidth={0.915}
        />
      </g>
    </g>
  </svg>
);
export default FlagTt;
