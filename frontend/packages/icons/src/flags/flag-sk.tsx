import React from 'react';

import type { FlagProps } from '../types';

const FlagSk = ({ className, testID }: FlagProps) => (
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
        fill="#3D58DB"
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
          d="M0 0v5h20V0H0z"
          fill="#F7FCFF"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 10v5h20v-5H0z"
          fill="#E31D1C"
        />
        <path
          d="m9.752 3.769.311-.033-.03-.28h-6.36l-.02.292.313.021-.312-.021v.003l-.001.007-.002.029-.007.11a78.473 78.473 0 0 0-.089 1.68c-.04.962-.067 2.089.003 2.615.137 1.026.762 3.33 3.18 4.375l.125.054.126-.056c2.296-1.026 3.064-3.094 3.241-4.372.09-.644.044-1.772-.018-2.71a51.146 51.146 0 0 0-.134-1.607l-.011-.103-.003-.028V3.736l-.312.033z"
          fill="#E31D1C"
          stroke="#fff"
          strokeWidth={0.625}
        />
        <mask
          id="prefix__c"
          maskUnits="userSpaceOnUse"
          x={3}
          y={3}
          width={8}
          height={10}
        >
          <path
            d="m9.752 3.769.311-.033-.03-.28h-6.36l-.02.292.313.021-.312-.021v.003l-.001.007-.002.029-.007.11a78.473 78.473 0 0 0-.089 1.68c-.04.962-.067 2.089.003 2.615.137 1.026.762 3.33 3.18 4.375l.125.054.126-.056c2.296-1.026 3.064-3.094 3.241-4.372.09-.644.044-1.772-.018-2.71a51.146 51.146 0 0 0-.134-1.607l-.011-.103-.003-.028V3.736l-.312.033z"
            fill="#fff"
            stroke="#fff"
            strokeWidth={0.625}
          />
        </mask>
        <g mask="url(#prefix__c)" fillRule="evenodd" clipRule="evenodd">
          <path
            d="M6.41 4.119s.13.196.188.497c.057.3.067.827.067.827l-1.224-.15v.928l1.252-.16-.02.882s-.375.038-.682 0a9.994 9.994 0 0 1-.912-.202v1.063s.614-.197.912-.242c.297-.045.681 0 .681 0v1.305h.508V7.562s.556-.048.887.004c.332.052.646.238.646.238V6.741s-.319.159-.619.198c-.3.04-.914.004-.914.004l.02-.881s.417-.043.65-.012c.233.032.525.171.525.171v-.928s-.285.155-.508.183c-.224.028-.694-.033-.694-.033s.009-.543.057-.808.184-.516.184-.516H6.411z"
            fill="#F7FCFF"
          />
          <path
            d="M4.31 10.153s.276-.59.722-.701c.447-.112.916.35.916.35s.286-.935.984-.935c.697 0 .942.936.942.936s.298-.351.726-.351.824.701.824.701-1.278 2.321-2.556 2.321c-1.279 0-2.557-2.32-2.557-2.32z"
            fill="#2E42A5"
          />
        </g>
      </g>
    </g>
  </svg>
);
export default FlagSk;
