import React from 'react';

import type { FlagProps } from '../types';

const FlagPy = ({ className, testID }: FlagProps) => (
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
      <g mask="url(#prefix__b)">
        <path
          d="M12.188 7.5a2.188 2.188 0 1 1-4.376 0 2.188 2.188 0 0 1 4.375 0z"
          stroke="#272727"
          strokeWidth={0.625}
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 0v5h20V0H0z"
          fill="#F05234"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 10v5h20v-5H0z"
          fill="#3D58DB"
        />
        <path
          d="M9.174 6.36s-.704.487-.45 1.432c.252.945 1.24.98 1.24.98"
          stroke="#73BE4A"
          strokeWidth={0.625}
        />
        <path
          d="M10.73 6.36s.704.487.45 1.432c-.253.945-1.24.98-1.24.98"
          stroke="#73BE4A"
          strokeWidth={0.625}
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M10.002 7.967a.625.625 0 1 0 0-1.25.625.625 0 0 0 0 1.25z"
          fill="#FBCD17"
        />
      </g>
    </g>
  </svg>
);
export default FlagPy;
