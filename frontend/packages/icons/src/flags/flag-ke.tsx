import React from 'react';

import type { FlagProps } from '../types';

const FlagKe = ({ className, testID }: FlagProps) => (
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
        d="M0 0v5h20V0H0z"
        fill="#272727"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 10v5h20v-5H0z"
        fill="#4E8B1D"
      />
      <path
        d="M0 4.375h-.625v6.25h21.25v-6.25H0z"
        fill="#E31D1C"
        stroke="#F7FCFF"
        strokeWidth={1.25}
      />
    </g>
    <path
      d="M11.812 2.418c.114-.246.42-.515.92-.807a.058.058 0 0 1 .056-.002c.03.016.043.054.028.085L7.637 12.871l-.27-.139 4.565-9.852c-.206-.035-.247-.19-.12-.462z"
      fill="#fff"
    />
    <path
      d="M8.183 2.418c.126.273.086.427-.121.462l4.565 9.853-.27.138L7.18 1.694a.065.065 0 0 1 .027-.085.058.058 0 0 1 .056.002c.5.292.807.56.92.807z"
      fill="#fff"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M10 12.568c.598 0 3-2.262 3-5.052 0-2.79-2.402-5.053-3-5.053-.598 0-3 2.262-3 5.053 0 2.79 2.402 5.052 3 5.052z"
      fill="#E31D1C"
    />
    <mask
      id="prefix__b"
      maskUnits="userSpaceOnUse"
      x={7}
      y={2}
      width={6}
      height={11}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 12.568c.598 0 3-2.262 3-5.052 0-2.79-2.402-5.053-3-5.053-.598 0-3 2.262-3 5.053 0 2.79 2.402 5.052 3 5.052z"
        fill="#fff"
      />
    </mask>
    <g mask="url(#prefix__b)">
      <path
        d="M4.3 11.937c2.32 0 4.2-1.98 4.2-4.421 0-2.442-1.88-4.421-4.2-4.421-2.32 0-4.2 1.98-4.2 4.42 0 2.442 1.88 4.422 4.2 4.422zm11.4 0c2.32 0 4.2-1.98 4.2-4.421 0-2.442-1.88-4.421-4.2-4.421-2.32 0-4.2 1.98-4.2 4.42 0 2.442 1.88 4.422 4.2 4.422z"
        fill="#272727"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.12 6.84c.274-.205.48-1.097.48-2.166 0-1.07-.206-1.962-.48-2.167V6.84zm-.3-.057c-.243-.282-.42-1.12-.42-2.11 0-.99.177-1.827.42-2.109v4.219zm0 1.466v4.218c-.243-.282-.42-1.12-.42-2.11 0-.989.177-1.827.42-2.108zm.3 4.275V8.192c.274.204.48 1.096.48 2.166 0 1.07-.206 1.961-.48 2.166z"
        fill="#F7FCFF"
      />
      <path
        d="M10 6.884c.331 0 .6.283.6.632 0 .349-.269.631-.6.631-.331 0-.6-.282-.6-.631 0-.349.269-.632.6-.632z"
        fill="#F7FCFF"
      />
    </g>
  </svg>
);

export default FlagKe;
