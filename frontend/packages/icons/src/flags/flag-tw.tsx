import React from 'react';

import type { FlagProps } from '../types';

const FlagTw = ({ className, testID }: FlagProps) => (
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
        fill="#EF0000"
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
        <path d="M0 0v8.75h11.25V0H0z" fill="#2E42A5" />
        <path
          d="M5.456 6.757 4.53 7.912l-.224-1.464-1.38.538.538-1.38L2 5.382l1.155-.926L2 3.53l1.464-.224-.538-1.38 1.38.538L4.53 1l.926 1.155L6.382 1l.224 1.464 1.38-.538-.538 1.38 1.464.224-1.155.926 1.155.926-1.464.224.538 1.38-1.38-.538-.224 1.464-.926-1.155zm0-.512a1.789 1.789 0 1 0 0-3.578 1.789 1.789 0 0 0 0 3.578zm1.431-1.789a1.431 1.431 0 1 1-2.862 0 1.431 1.431 0 0 1 2.862 0z"
          fill="#FEFFFF"
        />
      </g>
    </g>
  </svg>
);
export default FlagTw;
