import React from 'react';

import type { FlagProps } from '../types';

const FlagAw = ({ className, testID }: FlagProps) => (
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
        fill="#5BA3DA"
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
        <g filter="url(#prefix__c)">
          <path
            d="M3.546 4.975.808 4.397l2.772-.549.8-2.868.633 2.845 2.474.575-2.445.575-.706 2.34-.791-2.34z"
            fill="#EF2929"
          />
          <path
            d="M3.546 4.975.808 4.397l2.772-.549.8-2.868.633 2.845 2.474.575-2.445.575-.706 2.34-.791-2.34z"
            fill="red"
          />
        </g>
        <path d="M20 9H0v1h20V9zm0 2H0v1h20v-1z" fill="#FAD615" />
      </g>
    </g>
    <defs>
      <filter
        id="prefix__c"
        x={-0.192}
        y={-0.02}
        width={8.681}
        height={8.335}
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feFlood floodOpacity={0} result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
        />
        <feOffset />
        <feGaussianBlur stdDeviation={0.5} />
        <feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.2 0" />
        <feBlend in2="BackgroundImageFix" result="effect1_dropShadow" />
        <feBlend in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
      </filter>
    </defs>
  </svg>
);
export default FlagAw;
