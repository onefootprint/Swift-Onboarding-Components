import React from 'react';

import type { FlagProps } from '../types';

const FlagMd = ({ className, testID }: FlagProps) => (
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
        d="M13 0h7v15h-7V0z"
        fill="#D9071E"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 0h7v15H0V0z"
        fill="#3D58DB"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6 0h8v15H6V0z"
        fill="#FBCD17"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="m13.574 12.259-.658.36-2.182-3.994.658-.36 2.182 3.994zm-7.003.096.658.36L9.411 8.72l-.658-.36-2.182 3.994z"
        fill="#FD1900"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.111 5.868v3.47c0 .77-.663 1.775-.998 2.149-.335.373-1 1.23-1 1.23V3.38c0-1.047 1-1.407 1-1.407s.83.164.998 1.407v1.211c.257.203 1.115.823 1.669.561.658-.31.885-1.203.885-1.203s-.061-.9-.331-.9-.292-1.267.742-1.267 1.155.488 1.155.878c0 .204-.164.532-.32.844-.141.283-.276.553-.276.705 0 .321.242.943.596.943.248 0 1.442-.464 2.132-.74V3.38c.169-1.243.999-1.407.999-1.407s1 .36 1 1.407v9.336s-.665-.856-1-1.23c-.335-.373-.999-1.378-.999-2.148v-3.47H7.111zm1.108 6.527c.676-.44 1.665-2.414 1.665-2.414l.328.077s.501 1.307 1.975 2.337c-1.57.42-1.975 1.261-1.975 1.261 0-.673-1.993-1.26-1.993-1.26zm-.109-1.25c.456 0 .825-.349.825-.78 0-.432-.37-.782-.825-.782-.456 0-.825.35-.825.782 0 .431.37.78.825.78zm4.84-.78c0 .431-.37.78-.825.78-.456 0-.825-.349-.825-.78 0-.432.37-.782.825-.782.456 0 .825.35.825.782z"
        fill="#A77B3B"
      />
      <path
        d="m15.713 6.505.573.248-2.337 5.407-.574-.248 2.338-5.407z"
        fill="#FDFF00"
      />
      <path
        opacity={0.3}
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.9 4.896h6.6V9.67s-1.68.506-3.3 1.336C9.004 10.12 6.9 9.67 6.9 9.67V4.896z"
        fill="#E1E5E8"
      />
      <mask
        id="prefix__b"
        maskUnits="userSpaceOnUse"
        x={6}
        y={4}
        width={8}
        height={8}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M6.9 4.896h6.6V9.67s-1.68.506-3.3 1.336C9.004 10.12 6.9 9.67 6.9 9.67V4.896z"
          fill="#fff"
        />
      </mask>
      <g mask="url(#prefix__b)">
        <path fill="#3D58DB" d="M6.9 8.021h6.6v3.125H6.9z" />
        <path fill="#FD1900" d="M6.9 4.896h6.6v3.125H6.9z" />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="m9.867 6.301-.5.042.288-.39-.307-.402.502.064.193-.444.214.454.5-.042-.288.39.307.403-.502-.065-.193.444-.214-.454z"
          fill="#FDFF00"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M8.969 5.42s-1.344.817-.896 1.404c.448.587 1.012.662 1.012.662s-1.375 2.062 1.044 3.24c2.59-1.137 1.228-3.24 1.228-3.24s.798-.176.957-.81c.16-.635-1.042-1.363-1.042-1.363s.75 1.087.579 1.362c-.171.276-1.089.556-1.722.556s-1.61-.178-1.768-.659c-.158-.481.608-1.152.608-1.152z"
          fill="#FDFF00"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="m7.725 7.5.825.52-.825.522L6.9 8.02l.825-.521zm4.95 0 .825.52-.825.522-.825-.521.825-.521zM7.7 9.563a.25.25 0 1 0 0-.5.25.25 0 0 0 0 .5zm5.319-.473c-.215-.175-.544-.124-.735.112-.191.236-.172.568.042.742.117.095.056-.28.233-.52.148-.2.558-.255.46-.335z"
          fill="#FDFF00"
        />
      </g>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.96 7.206s.66.778 1.28.524c.62-.255.47-1.168.47-1.168l-.47.426h-.4v.218l-.313-.218v.218H2.96zm.446 1.197s.803.7 1.344.502c.541-.198.405-1.146.405-1.146l-.47.426h-.4v.218l-.312-.218v.218h-.567zm2.162 1.589c-.54.198-1.344-.503-1.344-.503h.567v-.217l.313.217v-.217h.4l.47-.426s.135.948-.406 1.146z"
        fill="#048F02"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.737 1.405h-.625v.373h-.294v.625h.294v1.09h.625v-1.09h.358v-.625h-.358v-.373z"
        fill="#FDFF00"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="m9.474 2.115-1.448.373 1.448.458v-.83z"
        fill="#DB4400"
      />
    </g>
  </svg>
);
export default FlagMd;
