import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoBuilding16 = ({ color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={16}
      height={16}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      data-testid={testID}
      className={className}
      aria-hidden="true"
    >
      <g clipPath="url(#prefix__a)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M1.397 2.625A2.625 2.625 0 0 1 4.022 0h7.97a2.625 2.625 0 0 1 2.624 2.625v10.969h.188a.75.75 0 1 1 0 1.5H1.21a.75.75 0 0 1 0-1.5h.188V2.625Zm5.25 10.969h2.72v-2.531c0-.622-.504-1.126-1.126-1.126h-.468c-.622 0-1.125.504-1.125 1.126v2.53Zm4.22 0v-2.531A2.625 2.625 0 0 0 8.24 8.437h-.468a2.625 2.625 0 0 0-2.625 2.626v2.53h-2.25V2.626c0-.621.503-1.125 1.124-1.125h7.97c.62 0 1.124.504 1.124 1.125v10.969h-2.25Zm-4.735-7.89a.031.031 0 1 0 0-.063.031.031 0 0 0 0 .062Zm-.969-.032a.969.969 0 1 1 1.938 0 .969.969 0 0 1-1.938 0Zm4.75 0a.031.031 0 1 1-.062 0 .031.031 0 0 1 .062 0Zm-.031-.969a.969.969 0 1 0 0 1.938.969.969 0 0 0 0-1.938Z"
          fill={theme.color[color]}
        />
      </g>
      <defs>
        <clipPath id="prefix__a">
          <path fill="#fff" d="M0 0h16v16H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};
export default IcoBuilding16;
