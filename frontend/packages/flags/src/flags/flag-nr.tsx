import React from 'react';

import type { FlagProps } from '../types';

const FlagNr = ({ className, testID }: FlagProps) => (
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
        fill="#2E42A5"
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
        <path d="M0 5v2.5h20V5H0z" fill="#FECA00" />
        <path
          d="m5.519 12.237-.966 1.254-.045-1.582-1.518.446.894-1.305-1.49-.532 1.49-.53-.894-1.306 1.518.446.045-1.582.966 1.254.965-1.254.045 1.582 1.518-.446-.894 1.305 1.49.531-1.49.532.894 1.305-1.518-.446-.045 1.582-.965-1.254z"
          fill="#F7FCFF"
        />
      </g>
    </g>
  </svg>
);
export default FlagNr;
