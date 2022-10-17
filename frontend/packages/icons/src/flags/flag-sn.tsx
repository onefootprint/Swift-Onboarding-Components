import React from 'react';

import type { FlagProps } from '../types';

const FlagSn = ({ className, testID }: FlagProps) => (
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
      <path d="M6.25 0h7.5v15h-7.5V0z" fill="#FBCD17" />
      <path
        d="M10.047 9.056 7.87 10.568l.696-2.589-1.6-1.653 2.166-.09.916-2.558.916 2.559h2.162L11.53 7.979l.799 2.436-2.282-1.359z"
        fill="#006923"
      />
      <path d="M13.75 0H20v15h-6.25V0z" fill="#E11C1B" />
      <path d="M0 0h6.25v15H0V0z" fill="#006923" />
    </g>
  </svg>
);
export default FlagSn;
