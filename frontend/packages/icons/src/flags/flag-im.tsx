import React from 'react';

import type { FlagProps } from '../types';

const FlagIm = ({ className, testID }: FlagProps) => (
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
        fill="#E31D1C"
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
          d="M3.808 2.588a.059.059 0 0 1 .104-.043c.28.307 1.023 1.072 1.452 1.072.537 0 2.645-1.776 3.268-1.487.623.29 1.885 3.316 1.885 3.316l-.822 1.031-1.063-.58-.2-2.28s-2.046 1.053-3.068.67l-.575.483s-.553-1.095-.771-1.43c-.144-.222-.193-.553-.21-.752z"
          fill="#F7FCFF"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="m5.164 5.078-.35.212.067-.45-.283-.317.39-.066.176-.408.175.408.39.066-.282.318.067.449-.35-.212zM8.133 2.37a.227.227 0 1 1 .453 0v1.071a.227.227 0 1 1-.453 0V2.37z"
          fill="#FECA00"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M15.763 3.19c.051.026.038.1-.019.11-.41.075-1.451.3-1.678.663-.285.455.104 3.185-.471 3.56-.576.375-3.81-.158-3.81-.158l-.44-1.244 1.055-.594 2.04 1.038s.192-2.293 1.057-2.957l-.105-.743s1.223.111 1.622.104c.265-.005.571.13.749.22z"
          fill="#F7FCFF"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="m12.933 3.02.006-.41.345.295.42-.071-.152.366.254.365-.44-.068-.262.297-.12-.409-.416-.181.365-.184zm.763 3.983a.245.245 0 1 1-.265.412l-.968-.647a.225.225 0 0 1 .244-.378l.99.613z"
          fill="#FECA00"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M9.29 13.115a.06.06 0 0 1-.088-.071c.14-.393.467-1.407.266-1.786-.252-.474-2.81-1.501-2.848-2.187-.037-.687 2.042-3.221 2.042-3.221l1.297.242-.013 1.21L8.028 8.55s1.889 1.312 2.031 2.394l.697.28s-.708 1.003-.902 1.353c-.128.231-.397.43-.565.538z"
          fill="#F7FCFF"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="m10.851 10.75.351.209-.427.152-.148.399-.242-.315-.442.037.278-.346-.126-.376.414.1.365-.27-.023.41zM6.94 9.348a.254.254 0 0 1-.183-.474l1.042-.407a.258.258 0 1 1 .186.482l-1.045.4z"
          fill="#FECA00"
        />
        <path
          d="M8.54 6.103a.153.153 0 0 1-.094-.193c.027-.08.151-.213.23-.186l1.084.38a.15.15 0 0 1 .1.13l.097 1.19c.007.084-.115.152-.197.16a.15.15 0 0 1-.16-.14l-.09-1.023-.97-.318z"
          fill="#FECA00"
        />
        <path
          d="M10.425 5.48c.065-.052.181.008.231.074a.155.155 0 0 1-.026.214l-.751.77c-.065.052-.21-.049-.261-.115-.05-.066-.065-.247 0-.3l.807-.643z"
          fill="#FECA00"
        />
      </g>
    </g>
  </svg>
);

export default FlagIm;
