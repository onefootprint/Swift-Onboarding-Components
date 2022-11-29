import React from 'react';

import type { FlagProps } from '../types';

const FlagMz = ({ className, testID }: FlagProps) => (
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
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 0v5h20V0H0z"
          fill="#FECA00"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 10v5h20v-5H0z"
          fill="#093"
        />
        <path
          d="M0 4.375h-.625v6.25h21.25v-6.25H0z"
          fill="#272727"
          stroke="#fff"
          strokeWidth={1.25}
        />
      </g>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 0v15l11.25-7.5L0 0z"
        fill="#F50100"
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
          d="m5.043 8.97-2.362 1.907L3.765 8.33 1.903 6.537H4.1l.902-2.162.957 2.162h2.194l-1.96 1.792.981 2.548-2.131-1.906z"
          fill="#FECA00"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="m3.847 7.49-.4 1.338s1.352-.013 1.515.123c.489-.305 1.496-.123 1.496-.123l-.535-1.432s-.68-.308-.961-.139c-.69-.156-1.115.233-1.115.233z"
          fill="#F7FCFF"
        />
        <path
          d="M7.227 9.51a.313.313 0 0 1-.499.376l-2.612-3.47a.312.312 0 1 1 .499-.375l2.612 3.47z"
          fill="#000"
        />
        <path
          d="m4.359 6.15-.25-.3"
          stroke="#000"
          strokeWidth={0.625}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="m3.503 5.852-.755 1.21.377.653.864-1.284.156-.397-.156-.182h-.486zm-.979 3.591.365.513 2.81-3.324.116.13.647-.61 1.036-1.125-1.035.846-.335-.093-.313.492H5.5L3.206 8.826l-.682.617z"
          fill="#000"
        />
      </g>
    </g>
  </svg>
);
export default FlagMz;
