import React from 'react';

import type { FlagProps } from '../types';

const FlagMy = ({ className, testID }: FlagProps) => (
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
        d="M0 0h20v15H0V0z"
        fill="#F7FCFF"
      />
      <path
        fill="#E31D1C"
        d="M.017 3.125h20v1.813h-20zm0 3.25h20v1.813h-20zM.07 9.5h20v1.563h-20zm0 3.125h20v1.688h-20z"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 0h20v1.563H0V0z"
        fill="#E31D1C"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 0h10v8.5H0V0z"
        fill="#3D58DB"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.246 3.876c0 .86.405 1.674 1.23 1.674 1.236 0 1.477-.264 2.054-.627.136.306-.324 1.617-2.072 1.617C2.061 6.512.931 5.39.931 3.876c0-1.736 1.278-2.674 2.492-2.663 1.073 0 2.21.608 2.176 1.385-.506-.494-1.054-.494-1.968-.494-.913 0-1.385.912-1.385 1.772z"
        fill="#FECA00"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="m6.875 4.563-.58.845.029-1.025-.966.344.625-.812L5 3.625l.983-.29-.625-.812.966.344-.028-1.025.579.845.58-.845-.029 1.025.966-.344-.625.812.983.29-.983.29.625.812-.966-.344.028 1.025-.579-.846z"
        fill="#FECA00"
      />
    </g>
  </svg>
);

export default FlagMy;
