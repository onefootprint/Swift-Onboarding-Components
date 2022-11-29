import React from 'react';

import type { FlagProps } from '../types';

const FlagMa = ({ className, testID }: FlagProps) => (
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
      <path
        d="M0 0h20v13.75c0 .69-.56 1.25-1.25 1.25H1.25C.56 15 0 14.44 0 13.75V0z"
        fill="#C51918"
      />
      <path d="M0 0h20v15H0V0z" fill="#E31D1C" />
      <path
        d="M14.051 12.266 10.104 1.688h-.172l-3.81 10.578 3.957-2.378 3.972 2.378zM9.667 5.14l.423-1.65.439 1.697 1.262 3.535.74 1.712-1.599-1.127-.854-.511-.84.505-1.562 1.133.722-1.747L9.667 5.14z"
        fill="#579D20"
      />
      <path
        d="M7.914 8.42 10.1 9.874l2.039-1.452 3.872-3.273H3.99L7.915 8.42zm.045-1.249-1.486-.91h7.015l-1.276.809-2.122 1.61-2.13-1.509z"
        fill="#579D20"
      />
    </g>
  </svg>
);
export default FlagMa;
