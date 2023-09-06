import React from 'react';

import type { FlagProps } from '../types';

const FlagJo = ({ className, testID }: FlagProps) => (
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
        <path d="M0 0v5h20V0H0z" fill="#272727" />
        <path d="M0 10v5h20v-5H0z" fill="#093" />
      </g>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 0v15l12.5-7.5L0 0z"
        fill="#E31D1C"
      />
      <mask
        id="prefix__c"
        maskUnits="userSpaceOnUse"
        x={0}
        y={0}
        width={13}
        height={15}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 0v15l12.5-7.5L0 0z"
          fill="#fff"
        />
      </mask>
      <g mask="url(#prefix__c)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="m5.626 8.67-1.17.705.268-1.377-.974-1.031 1.318-.056.558-1.286.558 1.286H7.5l-.971 1.087.292 1.377-1.195-.706z"
          fill="#F7FCFF"
        />
      </g>
    </g>
  </svg>
);
export default FlagJo;
