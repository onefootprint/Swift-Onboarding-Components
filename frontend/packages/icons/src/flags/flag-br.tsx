import React from 'react';

import type { FlagProps } from '../types';

const FlagBr = ({ className, testID }: FlagProps) => (
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
        fill="#093"
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
        <g filter="url(#prefix__c)" fillRule="evenodd" clipRule="evenodd">
          <path
            d="M9.954 2.315 17.58 7.63l-7.73 4.977-7.47-5.08 7.574-5.212z"
            fill="#FFD221"
          />
          <path
            d="M9.954 2.315 17.58 7.63l-7.73 4.977-7.47-5.08 7.574-5.212z"
            fill="url(#prefix__d)"
          />
        </g>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M10 10.75a3.125 3.125 0 1 0 0-6.25 3.125 3.125 0 0 0 0 6.25z"
          fill="#2E42A5"
        />
        <mask
          id="prefix__e"
          maskUnits="userSpaceOnUse"
          x={6}
          y={4}
          width={8}
          height={7}
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10 10.75a3.125 3.125 0 1 0 0-6.25 3.125 3.125 0 0 0 0 6.25z"
            fill="#fff"
          />
        </mask>
        <g mask="url(#prefix__e)" fill="#F7FCFF">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="m8.988 9.106-.14.074.027-.156-.113-.11.156-.023.07-.141.07.141.155.023-.113.11.027.156-.14-.074zm1.25 0-.14.074.027-.156-.113-.11.156-.023.07-.141.07.141.155.023-.113.11.027.156-.14-.074zm0 .75-.14.074.027-.156-.113-.11.156-.023.07-.141.07.141.155.023-.113.11.027.156-.14-.074zm-.625-2.625-.14.074.027-.156-.113-.11.156-.023.07-.141.07.141.155.023-.113.11.027.156-.14-.074zm0 1.25-.14.074.027-.156-.113-.11.156-.023.07-.141.07.141.155.023-.113.11.027.156-.14-.074zm-.876-.625-.14.074.028-.156-.113-.11.156-.023.07-.141.07.141.155.023-.113.11.027.156-.14-.074zm-.875.5-.14.074.028-.156-.113-.11.156-.023.07-.141.07.141.155.023-.113.11.027.156-.14-.074zm2.876-2.125-.14.074.027-.156-.113-.11.156-.023.07-.141.07.141.155.023-.112.11.026.156-.14-.074z"
          />
          <path d="m6.203 6.873.094-1.246c2.999.226 5.365 1.212 7.07 2.966l-.896.871c-1.478-1.52-3.557-2.386-6.268-2.59z" />
        </g>
      </g>
    </g>
    <defs>
      <linearGradient
        id="prefix__d"
        x1={20}
        y1={15}
        x2={20}
        y2={0}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#FFC600" />
        <stop offset={1} stopColor="#FFDE42" />
      </linearGradient>
      <filter
        id="prefix__c"
        x={2.381}
        y={2.315}
        width={15.2}
        height={10.292}
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feFlood floodOpacity={0} result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
        />
        <feOffset />
        <feColorMatrix values="0 0 0 0 0.0313726 0 0 0 0 0.368627 0 0 0 0 0 0 0 0 0.28 0" />
        <feBlend in2="BackgroundImageFix" result="effect1_dropShadow" />
        <feBlend in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
      </filter>
    </defs>
  </svg>
);
export default FlagBr;
