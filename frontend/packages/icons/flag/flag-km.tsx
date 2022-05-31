import React from 'react';

import type { FlagProps } from '../src/types';

const FlagKm = ({ className, testID }: FlagProps) => (
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
        fill="#5196ED"
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
      <g mask="url(#prefix__b)" fillRule="evenodd" clipRule="evenodd">
        <path d="M0 7.5v3.75h20V7.5H0z" fill="#AF0100" />
        <path d="M0 3.75V7.5h20V3.75H0z" fill="#F7FCFF" />
        <path d="M0 0v3.75h20V0H0z" fill="#FECA00" />
        <path d="m0 0 12.5 7.5L0 15V0z" fill="#5EAA22" />
        <path
          d="M4.94 10.683S2.7 9.904 2.78 7.468c.08-2.437 2.36-2.914 2.36-2.914-.799-.587-3.657.1-3.748 2.914-.092 2.813 2.697 3.438 3.548 3.215zm.068-4.26.07-.416-.297-.295.41-.06.184-.38.184.38.41.06-.297.295.07.417-.367-.197-.367.197zm.07.857-.07.417.367-.197.367.197-.07-.417.297-.295-.41-.06-.184-.38-.184.38-.41.06.297.295zm-.07 1.69.07-.417-.297-.295.41-.06.184-.38.184.38.41.06-.297.295.07.416-.367-.196-.367.196zm0 1.272.07-.416-.297-.295.41-.061.184-.38.184.38.41.06-.297.296.07.416-.367-.197-.367.197z"
          fill="#F7FCFF"
        />
      </g>
    </g>
  </svg>
);

export default FlagKm;
