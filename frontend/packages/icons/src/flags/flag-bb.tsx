import React from 'react';

import type { FlagProps } from '../types';

const FlagBb = ({ className, testID }: FlagProps) => (
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
      <path d="M14 0h6v15h-6V0z" fill="#2E42A5" />
      <path d="M6 0h8v15H6V0z" fill="#FECA00" />
      <path d="M0 0h6v15H0V0z" fill="#2E42A5" />
      <path
        d="M11.521 9.546c.396-.818.852-2.311.852-2.311l.346-1.028-1.372.497.325.188s-.566 1.131-.85 1.684c-.286.552-.314.187-.314.187l.049-3.855.315-.086-.785-1.507-1.001 1.528.44.012S9.49 8.923 9.43 8.763c-.034-.09-.125.19-.17.081-.278-.681-.658-2.002-.658-2.002l.222-.208-1.492-.307.445.918s.393 1.635.825 2.434c.097.252.566.36.566.36s.23-.233.286 0c.057.233 0 1.172 0 1.172h1.055s-.074-.886 0-1.172c.074-.286.304 0 .304 0s.612-.24.71-.493z"
        fill="#000"
      />
    </g>
  </svg>
);
export default FlagBb;
