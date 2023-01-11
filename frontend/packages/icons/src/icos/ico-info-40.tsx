import React from 'react';

import type { IconProps } from '../types';

const IcoInfo40 = ({ className, testID }: IconProps) => (
  <svg
    width={40}
    height={40}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    data-testid={testID}
    className={className}
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8.06 20.002c0-6.595 5.347-11.942 11.942-11.942 6.596 0 11.942 5.347 11.942 11.942 0 6.596-5.346 11.943-11.942 11.943-6.595 0-11.942-5.347-11.942-11.943ZM20.002 5.56c-7.976 0-14.442 6.466-14.442 14.442 0 7.977 6.466 14.442 14.442 14.442s14.442-6.466 14.442-14.442S27.978 5.56 20.002 5.56Zm-1.743 8.906a1.667 1.667 0 1 1 3.333 0 1.667 1.667 0 0 1-3.333 0Zm1.743 6.106c.69 0 1.25.56 1.25 1.25v3.639a1.25 1.25 0 1 1-2.5 0v-3.64c0-.69.56-1.25 1.25-1.25Z"
      fill="#000"
    />
  </svg>
);
export default IcoInfo40;
