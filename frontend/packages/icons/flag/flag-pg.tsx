import React from 'react';

import type { FlagProps } from '../src/types';

const FlagPg = ({ className, testID }: FlagProps) => (
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
      <rect width={20} height={15} rx={1.25} fill="#E11C1B" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="m0 0 20 15H0V0z"
        fill="#1D1D1D"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.427 11.418h.833l.395-.933.466.927.852.046-.728.793.374.956-.927-.532-.855.537.323-.928-.733-.866zm-2.5-2.5h.833l.395-.934.466.927.852.047-.728.793.374.956-.927-.532-.855.537.323-.928-.733-.866zm2.5-1.25h.833l.395-.934.466.927.852.047-.728.793.374.956-.927-.532-.855.537.323-.928-.733-.866z"
        fill="#EEEEF6"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="m6.07 10.353.572-.02.206-.59.232.587.527.051-.474.335.382.594-.664-.248-.574.256.303-.585-.51-.38zm1.25-1.25.572-.02.206-.59.232.587.527.051-.474.335.382.594-.664-.248-.575.256.304-.585-.51-.38z"
        fill="#EEEEF6"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.177 1.25s-1.93.385-1.388 3.069h-.276s.023-.14-.242-.222c-.265-.083-.212-.052-.348 0-.137.05-.968 0-.968 0v.102l.588.254s-.014.212.231.33c.246.116.425.173.425.173s.036.233-.194.233-1.158-.3-1.487.438a6.455 6.455 0 0 1-.768 1.28h.494l-.132.165h.556l-.15.085s.688-.008.742-.085c.054-.078 0 .21 0 .21s.667-.304.704-.375l.311.213.089-.361.334.148.09-.345s.946 1.581 1.663 1.49V7.79l.654.262.083-.116s.79.322 1.033.352l-.173-.352h.173l-.173-.654h.173l-.347-.523.097-.142-.064-.186s1.272.405 1.215 1.05c-.058.645-.624.905-.624.905s-.543.166-1.034.13c0 0 .39.46 1.214.305.824-.156 1.097-.955 1.097-.955s.378.785.067 1.198c-.311.412-1.697.702-1.697.702s.502.294.977.219c.475-.076 1.214-.49 1.357-1.164.144-.675-.494-1.92-.783-2.062l-.114-.432.26.104-.533-1.303.258.057-.753-.938.207-.064-1.041-.748.311-.083s-.77-.39-1.647.083l.008-.163-.23.039.013-.18.23-.347-.345-.133s.278-.418.237-.412c0 0-.31.089-.293.051 0 0 .157-.403.115-.392 0 0-.36.123-.306.061l.138-.246-.034-.463z"
        fill="#FBCD17"
      />
    </g>
  </svg>
);

export default FlagPg;
