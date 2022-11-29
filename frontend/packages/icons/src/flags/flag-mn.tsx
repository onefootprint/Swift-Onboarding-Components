import React from 'react';

import type { FlagProps } from '../types';

const FlagMn = ({ className, testID }: FlagProps) => (
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
      <path d="M6 0h8v15H6V0z" fill="#4C67E8" />
      <path d="M13 0h7v15h-7V0zM0 0h8v15H0V0z" fill="#C51918" />
      <path
        d="M3.759 4.303c-.634 0-.55-.617-.55-.617l.3-.649v.649c0 .083.114-.084.114-.285 0-.2.136-.501.136-.501l.009-.2a.588.588 0 0 0 .132.162l.036.038c.079.08.068.292.059.476-.008.167-.015.31.046.31.128 0 .119-.575.119-.575l.215.575s.017.617-.616.617zm0-1.763c.016-.094.014.032.009.16a.272.272 0 0 1-.01-.16zm.953 2.887c0 .502-.42.909-.938.909s-.937-.407-.937-.909c0-.501.42-.908.937-.908.518 0 .938.407.938.908zm-2.356 1.7H1.25v5.358h1.106V7.128zm3.894 0H5.144v5.358H6.25V7.128zm-3.606.047 1.078.668 1.215-.668H2.644zM3.722 12.5l-1.078-.667h2.293l-1.215.667zM2.644 8.06h2.26v.419h-2.26v-.42zm2.26 3.12h-2.26v.42h2.26v-.42zm-1.106-.232c.637 0 1.154-.501 1.154-1.119 0-.617-.517-1.118-1.154-1.118-.637 0-1.154.501-1.154 1.118 0 .618.517 1.118 1.154 1.118zM2.502 5.76s.039 1.167 1.19 1.167c1.15 0 1.335-1.167 1.335-1.167s-.445.715-1.262.715c-.818 0-1.263-.715-1.263-.715z"
        fill="#F8D000"
      />
    </g>
  </svg>
);
export default FlagMn;
