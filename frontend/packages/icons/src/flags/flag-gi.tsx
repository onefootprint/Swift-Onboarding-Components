import React from 'react';

import type { FlagProps } from '../types';

const FlagGi = ({ className, testID }: FlagProps) => (
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
      <path fill="#F7FCFF" d="M0 0h20v15H0z" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 10h20v5H0v-5z"
        fill="#C51918"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.838 2.042h-.921v.916h.454L9.34 5.48H7.996V4.333h.46v-.916h-.92v.458h-.461v-.458h-.921v.916h.46V5.48h-.971v.917h.46v2.75h-.46v.916h8.75v-.916h-.921v-2.75h.92V5.48h-.902l.023-1.146h.47v-.916h-.922v.458h-.46v-.458h-.921v.916h.451l-.023 1.146H10.72l.033-2.52h.466v-.917h-.92V2.5h-.461v-.458z"
        fill="#DB000B"
      />
      <path
        d="M7.132 5.48a.23.23 0 1 1 .46 0v1.145h-.46V5.48z"
        fill="#272727"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.76 8.556a.69.69 0 0 1 1.382 0V9.7H6.76V8.556zm5.066 0a.69.69 0 0 1 1.381 0V9.7h-1.381V8.556zm-2.763-.228a.921.921 0 0 1 1.842 0v1.83H9.063v-1.83z"
        fill="#272727"
      />
      <path
        d="M9.895 5.48a.23.23 0 0 1 .46 0v1.145h-.46V5.48zm2.763 0a.23.23 0 0 1 .46 0v1.145h-.46V5.48z"
        fill="#272727"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="m10.326 9.498-.113.208-.21-.314-1.724 1.155 1.922.915 1.696-1.108-1.57-.856zm-.787.957.555-.372.586.32-.527.344-.614-.292zm-.565 2.378h.92v.917h-.92v-.917z"
        fill="#E8AA00"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.5 11.25h1.093v2.5H9.5v-2.5z"
        fill="#E8AA00"
      />
    </g>
  </svg>
);
export default FlagGi;
