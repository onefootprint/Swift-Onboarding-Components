import React from 'react';

import type { FlagProps } from '../types';

const FlagEt = ({ className, testID }: FlagProps) => (
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
        fill="#FECA00"
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
          d="M0 0v5h20V0H0z"
          fill="#5EAA22"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 10v5h20v-5H0z"
          fill="#E31D1C"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M10 11.25a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5z"
          fill="#2B77B8"
        />
        <path
          clipRule="evenodd"
          d="m10 8.75-1.726.58.537-1.444-1.17-1.397h1.624L10 5l.735 1.489h1.66L11.19 7.886l.428 1.443L10 8.75z"
          stroke="#FECA00"
          strokeWidth={0.938}
        />
        <path
          d="m9.81 7.522-1.303 2.725m1.098-3.072h-2.5m2.971.849 2.443 1.127m-1.915-1.73 1.769-1.936"
          stroke="#2B77B8"
          strokeWidth={0.625}
        />
      </g>
    </g>
  </svg>
);
export default FlagEt;
