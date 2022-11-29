import React from 'react';

import type { FlagProps } from '../types';

const FlagMv = ({ className, testID }: FlagProps) => (
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
        d="M0 0h20v13.75c0 .69-.56 1.25-1.25 1.25H1.25C.56 15 0 14.44 0 13.75V0z"
        fill="#C51918"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 0h20v15H0V0z"
        fill="#C51918"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3 3h14v9H3V3z"
        fill="#579D20"
      />
      <path
        d="M3.625 3.625h12.75v7.75H3.625v-7.75z"
        stroke="#B6EB9A"
        strokeOpacity={0.238}
        strokeWidth={1.25}
      />
      <mask
        id="prefix__b"
        maskUnits="userSpaceOnUse"
        x={3}
        y={3}
        width={14}
        height={9}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M3 3h14v9H3V3z"
          fill="#fff"
        />
        <path
          d="M3.625 3.625h12.75v7.75H3.625v-7.75z"
          stroke="#fff"
          strokeWidth={1.25}
        />
      </mask>
      <g mask="url(#prefix__b)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M10.02 7.789c-.01 1.916 1.498 2.938 1.498 2.938-1.72.202-2.866-1.359-2.866-2.92 0-1.56 1.561-2.85 2.866-3.431 0 0-1.487 1.497-1.497 3.413z"
          fill="#F9FAFA"
        />
      </g>
    </g>
  </svg>
);
export default FlagMv;
