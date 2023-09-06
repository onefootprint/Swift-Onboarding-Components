import React from 'react';

import type { FlagProps } from '../types';

const FlagBqSa = ({ className, testID }: FlagProps) => (
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
      <path d="M0 0h20v15H0V0z" fill="#fff" />
      <path d="M0 7.29V0h10L0 7.29zm20 0V0H10l10 7.29z" fill="#F00000" />
      <path d="M0 7.29V15h10L0 7.29zm20 0v7.92L10 15l10-7.71z" fill="#00268D" />
      <path
        d="m9.821 8.91-2.198 1.567.807-2.588-2.18-1.585h2.715l.856-2.554.907 2.554h2.642L11.21 7.89l.82 2.588L9.822 8.91z"
        fill="#FEDA00"
      />
    </g>
  </svg>
);
export default FlagBqSa;
