import React from 'react';

import type { FlagProps } from '../types';

const FlagCi = ({ className, testID }: FlagProps) => (
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
    <g
      mask="url(#prefix__CI_-_C\xF4te_d'Ivoire_(Ivory_Coast)__a)"
      fillRule="evenodd"
      clipRule="evenodd"
    >
      <path d="M13.75 0H20v15h-6.25V0z" fill="#67BD38" />
      <path d="M0 0h6.25v15H0V0z" fill="#E47E00" />
      <path d="M6.25 0h7.5v15h-7.5V0z" fill="#F7FCFF" />
    </g>
  </svg>
);
export default FlagCi;
