import React from 'react';

import type { FlagProps } from '../src/types';

const FlagDz = ({ className, testID }: FlagProps) => (
  <svg
    width={20}
    height={15}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    data-testid={testID}
    className={className}
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M10 0h10v15H10V0z"
      fill="#F7FCFF"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M0 0h10v15H0V0z"
      fill="#36A400"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M11.637 3.908c.9 0 1.739.247 2.441.673a5.322 5.322 0 1 0-.302 7.222 4.724 4.724 0 0 1-2.139.505c-2.482 0-4.494-1.88-4.494-4.2 0-2.32 2.012-4.2 4.494-4.2zm1.76 1.608-1.292 1.465-1.857-.511 1.03 1.61-1.03 1.713 1.948-.7 1.064 1.66V8.826L15 8.08l-1.74-.623.137-1.94z"
      fill="red"
    />
  </svg>
);

export default FlagDz;
