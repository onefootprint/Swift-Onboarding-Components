import React from 'react';

import type { FlagProps } from '../src/types';

const FlagPk = ({ className, testID }: FlagProps) => (
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
      <path d="M5 0h15v15H5V0z" fill="#2F8D00" />
      <path d="M0 0h5v15H0V0z" fill="#F7FCFF" />
      <path
        d="M14.018 9.566s-2.79.728-5.006-.756C6.796 7.325 7.91 3.905 7.91 3.905c-1.155.168-2.97 4.384-.045 6.499 2.925 2.114 5.728.082 6.153-.838zm-3.097-4.024-1.482.724 1.564.279.21 1.528.886-1.302 1.743.118-1.365-1.018.727-1.36-1.36.622-1.009-.949.086 1.358z"
        fill="#F1F9FF"
      />
    </g>
  </svg>
);

export default FlagPk;
