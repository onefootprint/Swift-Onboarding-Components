import React from 'react';

import type { FlagProps } from '../types';

const FlagTr = ({ className, testID }: FlagProps) => (
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
        fill="#E31D1C"
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
      <g mask="url(#prefix__b)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M10.016 10.071c-1.338-.33-2.387-1.45-2.374-3.092.01-1.537.942-2.836 2.413-3.188 1.471-.352 2.766.395 2.766.395-.406-.96-1.819-1.634-2.977-1.633C7.688 2.557 5.39 4.305 5.37 6.98c-.02 2.772 2.461 4.35 4.644 4.347 1.75-.003 2.579-1.2 2.75-1.71 0 0-1.41.785-2.748.455zm3.049-3.617-1.334.49 1.505.53-.026 1.587.991-1.19 1.638.119-1.298-1.116.852-1.19-1.387.467-.992-1.102.05 1.405z"
          fill="#F7FCFF"
        />
      </g>
    </g>
  </svg>
);
export default FlagTr;
