import React from 'react';

import type { FlagProps } from '../types';

const FlagAz = ({ className, testID }: FlagProps) => (
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
        d="M0 0v15h20V0H0z"
        fill="#AF0100"
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
        <path d="M0 0v5h20V0H0z" fill="#3CA5D9" />
        <path d="M0 10v5h20v-5H0z" fill="#73BE4A" />
        <path
          d="M10.726 9.317c-.842-.194-1.5-.856-1.492-1.828.008-.909.595-1.678 1.52-1.887.927-.209 1.741.232 1.741.232-.255-.567-1.143-.965-1.872-.963-1.357.003-2.804 1.039-2.818 2.62-.015 1.64 1.546 2.571 2.919 2.568 1.1-.003 1.624-.712 1.732-1.013 0 0-.888.465-1.73.27zm.535-.93.735-.51.735.51-.26-.856.714-.54-.895-.019-.294-.845-.294.845-.895.018.713.541-.259.857z"
          fill="#F7FCFF"
        />
      </g>
    </g>
  </svg>
);

export default FlagAz;
