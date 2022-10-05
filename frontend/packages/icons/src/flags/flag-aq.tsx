import React from 'react';

import type { FlagProps } from '../types';

const FlagAq = ({ className, testID }: FlagProps) => (
  <svg
    width={20}
    height={15}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
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
        id="prefix__c"
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
      <g
        filter="url(#prefix__b)"
        fillRule="evenodd"
        clipRule="evenodd"
        mask="url(#prefix__c)"
      >
        <path
          d="M5.448 4.934s1.29.707 1.47.903c.18.196.467.915.915.508.448-.406.897-.09.897-.738 0-.647.67-2.15 1.64-1.773.972.376 1.77.14 1.995.291.224.151.762.899 1.18.899.419 0 .628.436.658 1.069.03.633-.135.693.254.768.388.076.538.362.344.738-.195.377-.18.211-.15.603.03.391-.388 2.7-1.674 2.927-1.285.225-2.504.105-2.175-.332.33-.437.784-.94.112-1.045-.673-.105-1.097-.195-1.77-.014-.672.18-1.374.467-1.793-.075-.418-.543-.328-.934-.672-1.19-.344-.256-.763-.211-.419-.708.344-.497.628-.311.344-.703-.284-.392-1.356-.562-1.356-.954 0-.391-.681-1.25.2-1.174z"
          fill="#fff"
        />
        <path
          d="M5.448 4.934s1.29.707 1.47.903c.18.196.467.915.915.508.448-.406.897-.09.897-.738 0-.647.67-2.15 1.64-1.773.972.376 1.77.14 1.995.291.224.151.762.899 1.18.899.419 0 .628.436.658 1.069.03.633-.135.693.254.768.388.076.538.362.344.738-.195.377-.18.211-.15.603.03.391-.388 2.7-1.674 2.927-1.285.225-2.504.105-2.175-.332.33-.437.784-.94.112-1.045-.673-.105-1.097-.195-1.77-.014-.672.18-1.374.467-1.793-.075-.418-.543-.328-.934-.672-1.19-.344-.256-.763-.211-.419-.708.344-.497.628-.311.344-.703-.284-.392-1.356-.562-1.356-.954 0-.391-.681-1.25.2-1.174z"
          fill="#F5F8FB"
        />
      </g>
    </g>
    <defs>
      <filter
        id="prefix__b"
        x={3.997}
        y={2.774}
        width={11.889}
        height={9.466}
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feFlood floodOpacity={0} result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
        />
        <feOffset />
        <feGaussianBlur stdDeviation={0.5} />
        <feColorMatrix values="0 0 0 0 0.0941176 0 0 0 0 0.32549 0 0 0 0 0.639216 0 0 0 0.43 0" />
        <feBlend in2="BackgroundImageFix" result="effect1_dropShadow" />
        <feBlend in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
      </filter>
    </defs>
  </svg>
);

export default FlagAq;
