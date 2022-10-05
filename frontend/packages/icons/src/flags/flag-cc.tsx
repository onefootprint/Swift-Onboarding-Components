import React from 'react';

import type { FlagProps } from '../types';

const FlagCc = ({ className, testID }: FlagProps) => (
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
    <g mask="url(#prefix__CC_-_Cocos_(Keeling)_Islands__a)">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 0h20v15H0V0z"
        fill="#5EAA22"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="m15 4.375-.625.458.084-.77-.709-.313.709-.313-.084-.77.625.458.625-.458-.084.77.709.313-.709.313.084.77L15 4.375zm-.648 4.175-.625.457.083-.77-.708-.313.708-.312-.083-.77.625.457.625-.457-.084.77.709.312-.709.313.084.77-.625-.458zm1.898 3.325-.625.457.084-.77L15 11.25l.709-.313-.084-.77.625.458.625-.457-.084.77.709.312-.709.313.084.77-.625-.458zm.625-5.937-.313.228.042-.385-.354-.156.354-.156-.041-.385.312.229.313-.23-.042.386.354.156-.354.156.041.385-.312-.229zM4.375 8.75a3.125 3.125 0 1 0 0-6.25 3.125 3.125 0 0 0 0 6.25z"
        fill="#FECA00"
      />
      <path
        d="m4.056 7.492-.224-.158c.496-.65.365-1.558.224-2.155l.912-.215c.21.89-.255 1.668-.912 2.528z"
        fill="#915E2B"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.436 9.34c-.411.707-1.065 1.027-1.94 1.027a2.371 2.371 0 0 1 0-4.742c1 0 1.796.35 2.162 1.302-.29-.287-.738-.484-1.408-.46-1.036 0-1.71.807-1.71 1.498 0 .69.675 1.628 1.71 1.628.52-.007.906-.103 1.186-.252z"
        fill="#FECA00"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.375 5.462c1.036 0 1.696-.28 1.696-.625s-.66-.625-1.696-.625-1.572.28-1.572.625.536.625 1.572.625z"
        fill="#5EAA22"
      />
    </g>
  </svg>
);

export default FlagCc;
