import React from 'react';

import type { FlagProps } from '../types';

const FlagCy = ({ className, testID }: FlagProps) => (
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
        fill="#F7FCFF"
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
        <path
          d="M15.355 2.974s-3.302 1.824-3.717 1.94c-.416.115-.139.184-.854.138-.716-.046-2.124.258-2.447.05-.324-.208-.44-.577-.462.046-.023.623.485 1.154-.162 1.2-.646.047-.715-.554-1.154-.184-.438.37-.808 1.2-1.085.992-.277-.207-.67-.761-.554-.23.115.53.462 1.868 1.57 1.89 1.108.024 1.339-.368 1.385-.045.046.323.53.369.646-.047.116-.415 1.062.464 1.57.025.508-.438.923-.808 1.085-1.062.162-.254.716-.207 1.247-.207.53 0 1.315.23.9-.277-.415-.508-1.131-.74-.716-1.247.416-.508 3.942-2.197 4.104-2.381.162-.185-.872-.877-1.356-.6z"
          fill="#F57A01"
        />
        <path
          d="M15.355 2.974s-3.302 1.824-3.717 1.94c-.416.115-.139.184-.854.138-.716-.046-2.124.258-2.447.05-.324-.208-.44-.577-.462.046-.023.623.485 1.154-.162 1.2-.646.047-.715-.554-1.154-.184-.438.37-.808 1.2-1.085.992-.277-.207-.67-.761-.554-.23.115.53.462 1.868 1.57 1.89 1.108.024 1.339-.368 1.385-.045.046.323.53.369.646-.047.116-.415 1.062.464 1.57.025.508-.438.923-.808 1.085-1.062.162-.254.716-.207 1.247-.207.53 0 1.315.23.9-.277-.415-.508-1.131-.74-.716-1.247.416-.508 3.942-2.197 4.104-2.381.162-.185-.872-.877-1.356-.6z"
          fill="url(#prefix__c)"
        />
        <path
          d="M6.82 10.065c1.639 0 3.047 1.824 3.047 1.824l.066.069.066-.07s1.642-1.823 3.281-1.823c1.64 0-1.18 2.655-3.004 2.655 0 0-.188-.017-.343-.095a1.1 1.1 0 0 1-.343.095c-1.823 0-4.41-2.655-2.77-2.655z"
          fill="#006B49"
        />
        <path
          d="M6.82 10.065c1.639 0 3.047 1.824 3.047 1.824l.066.069.066-.07s1.642-1.823 3.281-1.823c1.64 0-1.18 2.655-3.004 2.655 0 0-.188-.017-.343-.095a1.1 1.1 0 0 1-.343.095c-1.823 0-4.41-2.655-2.77-2.655z"
          fill="url(#prefix__d)"
        />
      </g>
    </g>
    <defs>
      <linearGradient
        id="prefix__c"
        x1={18.75}
        y1={11.25}
        x2={18.75}
        y2={1.25}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#EA5113" />
        <stop offset={1} stopColor="#FC9B58" />
      </linearGradient>
      <linearGradient
        id="prefix__d"
        x1={13.774}
        y1={12.72}
        x2={13.774}
        y2={10.065}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#008057" />
        <stop offset={1} stopColor="#00B77C" />
      </linearGradient>
    </defs>
  </svg>
);
export default FlagCy;
