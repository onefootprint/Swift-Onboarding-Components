import React from 'react';

import type { FlagProps } from '../types';

const FlagDj = ({ className, testID }: FlagProps) => (
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
        fill="#73BE4A"
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
          d="M0-1.25V7.5h20v-8.75H0z"
          fill="#69F"
        />
      </g>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 0v15l11.25-7.5L0 0z"
        fill="#fff"
      />
      <mask
        id="prefix__c"
        maskUnits="userSpaceOnUse"
        x={0}
        y={0}
        width={12}
        height={15}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 0v15l11.25-7.5L0 0z"
          fill="#fff"
        />
      </mask>
      <g mask="url(#prefix__c)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="m4.376 8.794-1.17.706.268-1.377L2.5 7.092l1.318-.056.558-1.286.558 1.286H6.25l-.971 1.087L5.57 9.5l-1.195-.706z"
          fill="#E31D1C"
        />
      </g>
    </g>
  </svg>
);
export default FlagDj;
