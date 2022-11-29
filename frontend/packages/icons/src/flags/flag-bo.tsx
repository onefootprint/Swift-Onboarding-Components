import React from 'react';

import type { FlagProps } from '../types';

const FlagBo = ({ className, testID }: FlagProps) => (
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
        fill="#FECA00"
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
          d="M0 0v5h20V0H0z"
          fill="#DB501C"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 10v5h20v-5H0z"
          fill="#5EAA22"
        />
        <path
          d="M7.28 7.038s-.233 2.38 1.883 2.38h1.577s2.226-.145 1.968-2.38"
          stroke="#DB501C"
          strokeWidth={0.938}
        />
        <path
          d="M11.406 7.375a1.406 1.406 0 1 1-2.812 0 1.406 1.406 0 0 1 2.812 0z"
          fill="#FECA00"
          stroke="#68B9E8"
          strokeWidth={0.938}
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M10 7.5a.625.625 0 1 0 0-1.25.625.625 0 0 0 0 1.25z"
          fill="#DB501C"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M10.063 8.5c.586 0 1.062-.224 1.062-.5s-.476-.5-1.063-.5C9.476 7.5 9 7.724 9 8s.476.5 1.063.5z"
          fill="#5EAA22"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M10.063 6.25c.828 0 1.5-.224 1.5-.5s-.672-.5-1.5-.5c-.829 0-1.5.224-1.5.5s.671.5 1.5.5z"
          fill="#674F28"
        />
      </g>
    </g>
  </svg>
);
export default FlagBo;
