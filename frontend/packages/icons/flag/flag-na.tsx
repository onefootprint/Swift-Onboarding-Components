import React from 'react';

import type { FlagProps } from '../src/types';

const FlagNa = ({ className, testID }: FlagProps) => (
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
        fill="#093"
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
          fill="#3195F9"
        />
        <path
          d="m-.633 16.933.332.601.567-.386L22.036 2.33l.439-.299-.224-.481-1.464-3.15-.307-.66-.606.404-22.097 14.722-.479.32.278.502 1.791 3.245z"
          fill="#E31D1C"
          stroke="#F7FCFF"
          strokeWidth={1.25}
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="m3.894 5.778-.81 1.009-.195-1.278-1.205.47.47-1.206-1.279-.196 1.01-.808-1.01-.81 1.278-.195-.47-1.205 1.206.47L3.085.75l.809 1.01.808-1.01.196 1.278 1.205-.47-.47 1.206 1.279.196-1.009.809 1.009.808-1.278.196.47 1.205-1.206-.47-.196 1.279-.808-1.009zm0-.447a1.563 1.563 0 1 0 0-3.125 1.563 1.563 0 0 0 0 3.125zm1.25-1.562a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0z"
          fill="#FECA00"
        />
      </g>
    </g>
  </svg>
);

export default FlagNa;
