import React from 'react';

import type { FlagProps } from '../types';

const FlagAr = ({ className, testID }: FlagProps) => (
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
      <g mask="url(#prefix__b)" fillRule="evenodd" clipRule="evenodd">
        <path d="M0 0v5h20V0H0zm0 10v5h20v-5H0z" fill="#58A5FF" />
        <path
          d="M10.345 9.054s-.638 1.325-1.2 1.596c.243-.607.332-1.846.332-1.846s-1.458.577-1.97.472c.616-.43 1.47-1.226 1.47-1.226s-1.887-.617-1.84-.879c.851.153 2.022-.014 2.022-.014S7.836 5.57 7.97 5.452c.202.196 1.788 1.025 1.788 1.025s.115-1.412.456-1.888c.041.336.52 1.857.52 1.857s.963-.963 1.498-.963c-.235.29-.791 1.57-.791 1.57s1.385-.022 1.912.237c-.638.09-1.756.652-1.756.652s1.456 1.104 1.324 1.334c-.782-.382-1.686-.51-1.686-.51s.25 1.537.048 1.884c-.197-.511-.938-1.596-.938-1.596z"
          fill="#FFD018"
          stroke="#F19900"
          strokeOpacity={0.98}
          strokeWidth={0.5}
        />
        <path
          d="M10.262 8.339a.625.625 0 1 0 0-1.25.625.625 0 0 0 0 1.25z"
          fill="#FFD018"
          stroke="#F19900"
          strokeOpacity={0.98}
          strokeWidth={0.5}
        />
      </g>
    </g>
  </svg>
);

export default FlagAr;
