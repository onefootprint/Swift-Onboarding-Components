import React from 'react';

import type { FlagProps } from '../types';

const FlagEh = ({ className, testID }: FlagProps) => (
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
    <g mask="url(#prefix__a)" fillRule="evenodd" clipRule="evenodd">
      <path d="M0 0h20v15H0V0z" fill="#F7FCFF" />
      <path d="M0 0v5h20V0H0z" fill="#272727" />
      <path d="M0 10v5h20v-5H0z" fill="#5EAA22" />
      <path
        d="m0 0 10 7.5L0 15V0zm13.555 9.673s-1.422-.859-1.422-2.279 1.422-2.167 1.422-2.167c-.636-.404-2.843.173-2.843 2.213 0 2.041 2.186 2.418 2.843 2.233zm1.15-2.603-.827-.775.286.99-.801.38.983.32.428 1.07.186-.991.972.214-.735-.717.248-.766-.74.275z"
        fill="#E31D1C"
      />
    </g>
  </svg>
);
export default FlagEh;
