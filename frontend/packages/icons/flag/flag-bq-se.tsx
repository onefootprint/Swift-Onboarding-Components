import React from 'react';

import type { FlagProps } from '../src/types';

const FlagBqSe = ({ className, testID }: FlagProps) => (
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
        d="M0 0h20v15H0V0z"
        fill="#00268D"
      />
      <path
        d="M.625.625h18.75v13.75H.625V.625z"
        fill="#00268D"
        stroke="#E31D1C"
        strokeWidth={1.25}
      />
      <path fill="#E31D1C" d="M9.375 0h1.25v15h-1.25z" />
      <path fill="#E31D1C" d="M0 8.125v-1.25h20v1.25z" />
      <path
        d="m10.28 3.816-.28-.14-.28.14-6.25 3.125-1.118.559 1.118.559 6.25 3.125.28.14.28-.14 6.25-3.125 1.117-.559-1.117-.559-6.25-3.125z"
        fill="#fff"
        stroke="#E31D1C"
        strokeWidth={1.25}
      />
      <mask
        id="prefix__b"
        maskUnits="userSpaceOnUse"
        x={0}
        y={2}
        width={20}
        height={11}
      >
        <path
          d="m10.28 3.816-.28-.14-.28.14-6.25 3.125-1.118.559 1.118.559 6.25 3.125.28.14.28-.14 6.25-3.125 1.117-.559-1.117-.559-6.25-3.125z"
          fill="#fff"
          stroke="#fff"
          strokeWidth={1.25}
        />
      </mask>
      <g mask="url(#prefix__b)">
        <path
          d="M7.256 10h8.369l-.885-.957s-1.77-1.893-1.883-1.98c-.114-.086-.302-.124-.516.152-.215.276-.337-.151-.516-.151-.178 0-.253 0-.512.353l-1.19 1.626H8.755s-.231-.209-.363-.134c-.131.074-.872-.825-1.136-.892-.264-.067-.438.243-.438.49 0 .248-.124-.226-.377-.087-.253.14-.171.489-.171.489S7.087 10 7.256 10z"
          fill="#059334"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="m9.753 7.034-.617.466.226-.77-.612-.47h.763l.24-.76.255.76h.742l-.607.47.23.77-.62-.466z"
          fill="#FEDA00"
        />
      </g>
    </g>
  </svg>
);

export default FlagBqSe;
