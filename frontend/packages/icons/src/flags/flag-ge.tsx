import React from 'react';

import type { FlagProps } from '../types';

const FlagGe = ({ className, testID }: FlagProps) => (
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
      <g
        mask="url(#prefix__b)"
        fillRule="evenodd"
        clipRule="evenodd"
        fill="#E31D1C"
      >
        <path d="M8.75 0h2.5v6.25H20v2.5h-8.75V15h-2.5V8.75H0v-2.5h8.75V0z" />
        <path d="m6.25 10.764 1.375-.139v1.25s-1.376-.086-1.376-.061c0 .025.126 1.311.126 1.311h-1.25l.1-1.25h-1.35v-1.25l1.35.139-.1-1.389h1.25l-.126 1.389zm0-7.5 1.375-.139v1.25s-1.376-.086-1.376-.061c0 .025.126 1.311.126 1.311h-1.25l.1-1.25h-1.35v-1.25l1.35.139-.1-1.389h1.25l-.126 1.389zm8.75 0 1.375-.139v1.25s-1.376-.086-1.376-.061c0 .025.126 1.311.126 1.311h-1.25l.1-1.25h-1.35v-1.25l1.35.139-.1-1.389h1.25l-.126 1.389zm0 7.5 1.375-.139v1.25s-1.376-.086-1.376-.061c0 .025.126 1.311.126 1.311h-1.25l.1-1.25h-1.35v-1.25l1.35.139-.1-1.389h1.25l-.126 1.389z" />
      </g>
    </g>
  </svg>
);
export default FlagGe;
