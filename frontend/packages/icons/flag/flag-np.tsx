import React from 'react';

import type { FlagProps } from '../src/types';

const FlagNp = ({ className, testID }: FlagProps) => (
  <svg
    width={20}
    height={15}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    data-testid={testID}
    className={className}
    aria-hidden="true"
  >
    <path fill="#fff" d="M0 0h20v15H0z" />
    <path
      d="m7.118 7.938 5.554 6.562H.5V.978l11.501 6.137H6.422l.696.823z"
      fill="#C51918"
      stroke="#4857A1"
    />
    <mask
      id="prefix__a"
      maskUnits="userSpaceOnUse"
      x={0}
      y={0}
      width={14}
      height={15}
    >
      <path
        d="m7.118 7.938 5.554 6.562H.5V.978l11.501 6.137H6.422l.696.823z"
        fill="#fff"
        stroke="#fff"
      />
    </mask>
    <g mask="url(#prefix__a)" fillRule="evenodd" clipRule="evenodd">
      <path
        d="m3.644 12.545-.766.978-.036-1.234-1.203.348.708-1.02-1.181-.414 1.181-.415-.708-1.02 1.203.35.036-1.236.766.979.765-.979.036 1.235 1.203-.348-.708 1.02 1.181.414-1.181.415.708 1.019-1.203-.348-.036 1.234-.765-.978zM3.625 5.24l-.4.51-.018-.645-.629.182.37-.532-.617-.217.617-.216-.37-.533.629.182.018-.644.4.51.4-.51.018.644.629-.182-.37.533.617.216-.617.217.37.532-.629-.182-.018.645-.4-.51z"
        fill="#F7FCFF"
      />
      <path
        d="M3.54 5.09c1.37.005 2.101-.785 2.101-.785.145.901-.971 1.5-2.087 1.5s-1.792-.817-2.208-1.5c0 0 .825.779 2.195.784z"
        fill="#F9FAFA"
      />
    </g>
  </svg>
);

export default FlagNp;
