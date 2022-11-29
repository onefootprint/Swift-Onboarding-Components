import React from 'react';

import type { FlagProps } from '../types';

const FlagPa = ({ className, testID }: FlagProps) => (
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
      <g mask="url(#prefix__b)" fillRule="evenodd" clipRule="evenodd">
        <path
          d="M10 0v7.5h10V0H10zm4.388 11.969-1.439.89.559-1.495-1.223-1.132h1.483l.62-1.616.473 1.617h1.486l-1.07 1.131.524 1.495-1.413-.89z"
          fill="#E31D1C"
        />
        <path
          d="m5.638 5.228-1.439.89.559-1.494-1.223-1.132h1.483l.62-1.617.473 1.617h1.486l-1.07 1.132.523 1.494-1.412-.89zM0 7.5V15h10V7.5H0z"
          fill="#2E42A5"
        />
      </g>
    </g>
  </svg>
);
export default FlagPa;
