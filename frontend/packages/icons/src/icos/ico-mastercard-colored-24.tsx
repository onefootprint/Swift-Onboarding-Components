import React from 'react';

import type { IconProps } from '../types';

const IcoMastercard24 = ({ 'aria-label': ariaLabel, className, testID }: IconProps) => (
  <svg
    width={24}
    height={24}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    data-testid={testID}
    aria-label={ariaLabel}
    className={className}
    role="img"
    data-colored
  >
    <g clipPath="url(#prefix__a)">
      <path d="M15.245 6.18h-6.49V17.84h6.49V6.18Z" fill="#FF5F00" />
      <path
        d="M9.167 12.01A7.404 7.404 0 0 1 12 6.18a7.417 7.417 0 1 0 0 11.662 7.403 7.403 0 0 1-2.833-5.831Z"
        fill="#EB001B"
      />
      <path
        d="M24 12.01a7.416 7.416 0 0 1-12 5.832 7.417 7.417 0 0 0 0-11.663 7.416 7.416 0 0 1 12 5.832ZM23.293 16.606v-.239h.096v-.048h-.245v.048h.096v.24h.053Zm.476 0v-.288h-.076l-.086.198-.087-.198h-.075v.288h.053v-.217l.081.187h.055l.081-.187v.217h.053Z"
        fill="#F79E1B"
      />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="#fff" d="M0 0h24v24H0z" />
      </clipPath>
    </defs>
  </svg>
);
export default IcoMastercard24;
