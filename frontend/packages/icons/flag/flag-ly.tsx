import React from 'react';

import type { FlagProps } from '../src/types';

const FlagLy = ({ className, testID }: FlagProps) => (
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
    <g mask="url(#prefix__a)" fillRule="evenodd" clipRule="evenodd">
      <path d="M0 11h20v4H0v-4z" fill="#55BA07" />
      <path d="M0 3.75h20v7.5H0v-7.5z" fill="#1D1D1D" />
      <path d="M0 0h20v4H0V0z" fill="#E11C1B" />
      <path
        d="M9.873 9.416c-1.12-.231-1.41-.817-1.398-1.721 0-.957.504-1.925 1.387-2.031.884-.106 1.607.224 1.986.684-.317-1.249-1.368-1.385-2.175-1.385-1.214-.011-2.46.912-2.46 2.649 0 1.513 1.098 2.65 2.495 2.678 1.748 0 2.021-1.206 2.072-1.617-.101.072-.195.159-.292.247-.351.324-.736.678-1.615.496zm2.791-2.359-.827.26.927.363-.13.971.629-.668.91.187-.615-.72.545-.735-.76.16-.539-.607-.14.789z"
        fill="#fff"
      />
    </g>
  </svg>
);

export default FlagLy;
