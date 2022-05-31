import React from 'react';

import type { FlagProps } from '../src/types';

const FlagBz = ({ className, testID }: FlagProps) => (
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
        fill="#0168B4"
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
          d="M0-1v3h20v-3H0zm0 14v3h20v-3H0z"
          fill="#E93C43"
        />
        <path
          d="M10 11.25a3.75 3.75 0 1 1 0-7.5 3.75 3.75 0 0 1 0 7.5z"
          fill="#F7FCFF"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M5.625 7.5a4.375 4.375 0 1 0 8.75 0 4.375 4.375 0 0 0-8.75 0zm8.125 0a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0z"
          fill="#fff"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M6.25 7.5a3.75 3.75 0 1 0 7.5 0 3.75 3.75 0 0 0-7.5 0zm6.625 0a2.875 2.875 0 1 1-5.75 0 2.875 2.875 0 0 1 5.75 0z"
          fill="#5B8C39"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="m8.125 8.75 1.837-.235 1.913.235v.625L9.962 9.14l-1.837.235V8.75z"
          fill="#5B8C39"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M8.75 6.25h2.5S11.427 10 10 10 8.75 6.25 8.75 6.25z"
          fill="#769DF1"
        />
        <path fill="#FECA00" d="M10 6.25h1.25V7.5H10z" />
        <path opacity={0.6} fill="#F6F7F8" d="M8.75 6.25H10V7.5H8.75z" />
        <rect
          opacity={0.66}
          x={8.75}
          y={5}
          width={2.5}
          height={1.25}
          rx={0.625}
          fill="#5B8C39"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M8.625 8c.345 0 .625-.56.625-1.25S8.97 5.5 8.625 5.5 8 6.06 8 6.75 8.28 8 8.625 8z"
          fill="#E9AD35"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M11.375 8C11.72 8 12 7.44 12 6.75s-.28-1.25-.625-1.25-.625.56-.625 1.25.28 1.25.625 1.25z"
          fill="#5C2216"
        />
      </g>
    </g>
  </svg>
);

export default FlagBz;
