import React from 'react';

import type { FlagProps } from '../types';

const FlagSb = ({ className, testID }: FlagProps) => (
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
        fill="#3D58DB"
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
          d="M0 15h20V0L0 15z"
          fill="#579D20"
        />
        <path
          d="m-.489 15.466-1.127-1.56L21.047-1.221l1.127 1.56L-.489 15.466z"
          fill="#FECA00"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="m2.283 4.092.853-.591.892.53-.313-.952.625-.682h-.846l-.358-1-.359 1-.847.035.626.647-.273 1.013zm3.537 0 .852-.591.892.53-.312-.952.624-.682H7.03l-.358-1-.359 1-.847.035.626.647-.272 1.013z"
          fill="#F7FCFF"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="m4.155 5.91.852-.592.893.531-.313-.952.624-.682h-.845l-.359-1.001-.358 1-.847.036.625.647-.272 1.012zm-1.02 1.34-.852.592.273-1.013-.626-.647.847-.035.359-1 .358 1h.846l-.625.682.313.953-.892-.532zm3.537 0-.852.592.272-1.013-.626-.647.847-.035.359-1 .358 1h.846l-.624.682.312.953-.892-.532z"
          fill="#F7FCFF"
        />
      </g>
    </g>
  </svg>
);

export default FlagSb;
