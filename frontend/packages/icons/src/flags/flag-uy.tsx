import React from 'react';

import type { FlagProps } from '../types';

const FlagUy = ({ className, testID }: FlagProps) => (
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
          fill="#2E42A5"
          d="M0 2.5h20v1.25H0zM0 5h20v1.25H0zm0 2.5h20v1.25H0zM0 10h20v1.25H0zm0 2.5h20v1.25H0z"
        />
        <path fill="#F7FCFF" d="M0 0h10v8.75H0z" />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M5.767 6.898s-.638 1.324-1.2 1.596c.242-.607.332-1.847.332-1.847s-1.458.578-1.97.473c.616-.43 1.47-1.226 1.47-1.226s-1.887-.617-1.84-.88c.851.153 2.022-.013 2.022-.013s-1.323-1.587-1.19-1.705C3.595 3.492 5.18 4.32 5.18 4.32s.115-1.412.456-1.888c.04.336.52 1.858.52 1.858s.963-.964 1.498-.964c-.235.291-.791 1.57-.791 1.57s1.385-.022 1.912.238c-.638.09-1.756.652-1.756.652S8.475 6.89 8.342 7.12c-.781-.383-1.685-.51-1.685-.51s.25 1.536.048 1.884c-.197-.512-.938-1.596-.938-1.596z"
          fill="#FFD018"
          stroke="#F19900"
          strokeOpacity={0.98}
          strokeWidth={0.5}
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M5.683 6.182a.625.625 0 1 0 0-1.25.625.625 0 0 0 0 1.25z"
          fill="#FFD018"
          stroke="#F19900"
          strokeOpacity={0.98}
          strokeWidth={0.5}
        />
      </g>
    </g>
  </svg>
);
export default FlagUy;
