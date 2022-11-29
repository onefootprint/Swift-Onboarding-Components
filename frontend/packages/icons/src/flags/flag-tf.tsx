import React from 'react';

import type { FlagProps } from '../types';

const FlagTf = ({ className, testID }: FlagProps) => (
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
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M11.743 3.875h5.03l-.49.94h-1.526v.505h1.17l-.477.874h-.693v1.75l1.142-1.8 1.478 2.559h-.604l-.21-.28h-1.338l-.941 1.738v.096l-.026-.048-.026.048v-.096l-.94-1.738h-1.338l-.211.28h-.604l1.478-2.56 1.142 1.8V4.815h-1.526l-.49-.94zm4.185 3.318-.328.505h.622l-.294-.505zm-3.34 0 .328.505h-.621l.293-.505zm-2.392-.56.52-.383.519.383-.183-.641.504-.405-.633-.014-.208-.633-.207.633-.633.014.504.405-.183.641zm7.589-.383-.52.383.183-.641-.504-.405.633-.014.208-.633.207.633.633.014-.504.405.183.641-.52-.383zm-2.11 4.877.519-.383.52.383-.184-.642.504-.405-.632-.013-.208-.634-.208.634-.632.013.504.405-.183.642zm-3.369-.383-.52.383.184-.642-.504-.405.632-.013.208-.634.208.634.632.013-.504.405.183.642-.519-.383zm1.425 1.881.519-.383.52.383-.184-.642.504-.405-.632-.013-.208-.634-.208.634-.632.013.504.405-.183.642z"
          fill="#F7FCFF"
        />
        <path
          fill="#2E42A5"
          stroke="#fff"
          strokeWidth={0.625}
          d="M-.313-.313h8.125v6.875H-.313z"
        />
        <mask
          id="prefix__c"
          maskUnits="userSpaceOnUse"
          x={-1}
          y={-1}
          width={10}
          height={8}
        >
          <path
            fill="#fff"
            stroke="#fff"
            strokeWidth={0.625}
            d="M-.313-.313h8.125v6.875H-.313z"
          />
        </mask>
        <g mask="url(#prefix__c)" fillRule="evenodd" clipRule="evenodd">
          <path d="M5 0h2.5v6.25H5V0z" fill="#F50100" />
          <path d="M0 0h2.5v6.25H0V0z" fill="#2E42A5" />
          <path d="M2.5 0H5v6.25H2.5V0z" fill="#F7FCFF" />
        </g>
      </g>
    </g>
  </svg>
);
export default FlagTf;
