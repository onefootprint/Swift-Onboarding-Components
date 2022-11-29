import React from 'react';

import type { FlagProps } from '../types';

const FlagGg = ({ className, testID }: FlagProps) => (
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
        <path d="M7.5 0h5v5H20v5h-7.5v5h-5v-5H0V5h7.5V0z" fill="#E31D1C" />
        <path
          d="M8.128 1.904 8.75 3v3.25H4.29v-.036l-1.099-.623v3.725l1.04-.566H8.75v3.157l-.622 1.096h3.726l-.599-1.1h-.005V8.75h4.5l1.04.566V5.591l-1.099.623v.036H11.25V3.003h.005l.599-1.1H8.128z"
          fill="#FECA00"
        />
      </g>
    </g>
  </svg>
);
export default FlagGg;
