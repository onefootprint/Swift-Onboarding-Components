import React from 'react';

import type { FlagProps } from '../src/types';

const FlagGbUkm = ({ className, testID }: FlagProps) => (
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
        fill="#2E42A5"
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
        <mask
          id="prefix__c"
          maskUnits="userSpaceOnUse"
          x={0}
          y={0}
          width={20}
          height={15}
        >
          <path fill="#fff" d="M0 0h20v15H0z" />
        </mask>
        <g mask="url(#prefix__c)">
          <path
            d="m-2.227 13.928 4.401 1.862L20.1 2.024l2.32-2.766-4.706-.622-7.312 5.932L4.52 8.565l-6.746 5.363z"
            fill="#fff"
          />
          <path
            d="m-1.624 15.232 2.242 1.08 20.97-17.31h-3.149l-20.062 16.23z"
            fill="#F50100"
          />
          <path
            d="m22.227 13.928-4.401 1.862L-.1 2.024-2.42-.742l4.706-.622 7.311 5.932 5.886 3.997 6.745 5.363z"
            fill="#fff"
          />
          <path
            d="m22.077 14.864-2.242 1.08-8.93-7.412-2.647-.828L-2.645-.733H.504L11.4 7.504l2.895.993 7.782 6.367z"
            fill="#F50100"
          />
          <mask id="prefix__d" fill="#fff">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12.361-1.25H7.64V5h-8.872v5H7.64v6.25h4.722V10h8.906V5h-8.906v-6.25z"
            />
          </mask>
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12.361-1.25H7.64V5h-8.872v5H7.64v6.25h4.722V10h8.906V5h-8.906v-6.25z"
            fill="#F50100"
          />
          <path
            d="M7.639-1.25V-2.5h-1.25v1.25h1.25zm4.722 0h1.25V-2.5h-1.25v1.25zM7.64 5v1.25h1.25V5H7.64zm-8.872 0V3.75h-1.25V5h1.25zm0 5h-1.25v1.25h1.25V10zm8.872 0h1.25V8.75H7.64V10zm0 6.25H6.39v1.25h1.25v-1.25zm4.722 0v1.25h1.25v-1.25h-1.25zm0-6.25V8.75h-1.25V10h1.25zm8.906 0v1.25h1.25V10h-1.25zm0-5h1.25V3.75h-1.25V5zm-8.906 0h-1.25v1.25h1.25V5zM7.64 0h4.722v-2.5H7.64V0zm1.25 5v-6.25h-2.5V5h2.5zM-1.233 6.25H7.64v-2.5h-8.872v2.5zM.017 10V5h-2.5v5h2.5zM7.64 8.75h-8.872v2.5H7.64v-2.5zm1.25 7.5V10h-2.5v6.25h2.5zM12.36 15H7.64v2.5h4.722V15zm-1.25-5v6.25h2.5V10h-2.5zm10.156-1.25H12.36v2.5h8.906v-2.5zM20.017 5v5h2.5V5h-2.5zm-7.656 1.25h8.906v-2.5h-8.906v2.5zm-1.25-7.5V5h2.5v-6.25h-2.5z"
            fill="#fff"
            mask="url(#prefix__d)"
          />
        </g>
      </g>
    </g>
  </svg>
);

export default FlagGbUkm;
