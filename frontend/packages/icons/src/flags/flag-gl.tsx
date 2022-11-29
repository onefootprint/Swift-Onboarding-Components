import React from 'react';

import type { FlagProps } from '../types';

const FlagGl = ({ className, testID }: FlagProps) => (
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
        d="M0 7.5h20V15H0V7.5z"
        fill="#C51918"
      />
      <mask
        id="prefix__b"
        maskUnits="userSpaceOnUse"
        x={0}
        y={7}
        width={20}
        height={8}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 7.5h20V15H0V7.5z"
          fill="#fff"
        />
      </mask>
      <g mask="url(#prefix__b)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M7.5 12.5a5 5 0 1 0 0-10 5 5 0 0 0 0 10z"
          fill="#F7FCFF"
        />
      </g>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 0h20v7.5H0V0z"
        fill="#F7FCFF"
      />
      <mask
        id="prefix__c"
        maskUnits="userSpaceOnUse"
        x={0}
        y={0}
        width={20}
        height={8}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 0h20v7.5H0V0z"
          fill="#fff"
        />
      </mask>
      <g mask="url(#prefix__c)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M7.5 12.5a5 5 0 1 0 0-10 5 5 0 0 0 0 10z"
          fill="#C51918"
        />
      </g>
    </g>
  </svg>
);
export default FlagGl;
