import React from 'react';

import type { FlagProps } from '../types';

const FlagNi = ({ className, testID }: FlagProps) => (
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
      <g mask="url(#prefix__b)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 0v5h20V0H0zm0 10v5h20v-5H0z"
          fill="#0080EC"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M10 5c.118 0 .234.008.347.024l-.124.797a1.71 1.71 0 0 0-.545.016L9.62 5.03A2.52 2.52 0 0 1 10 5zm.72.105-.217.778a1.694 1.694 0 0 1 1.19 1.673l.804.068a2.501 2.501 0 0 0-1.777-2.519zm1.476 3.591a2.5 2.5 0 0 1-2.01 1.297v-.81c.462-.05.869-.287 1.143-.634l.867.147zm-4.335.098a2.5 2.5 0 0 0 1.996 1.202v-.809a1.691 1.691 0 0 1-1.21-.668l-.787.275zm-.359-1.187A2.5 2.5 0 0 1 9.095 5.17l.209.787c-.585.264-.992.85-.997 1.532l-.805.12z"
          fill="#D0AB00"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M9.984 5.594 8.274 8.55h3.448L9.984 5.594z"
          fill="#7CDFFF"
        />
        <mask
          id="prefix__c"
          maskUnits="userSpaceOnUse"
          x={8}
          y={5}
          width={4}
          height={4}
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M9.984 5.594 8.274 8.55h3.448L9.984 5.594z"
            fill="#fff"
          />
        </mask>
        <g mask="url(#prefix__c)">
          <path
            d="M10 9.449a1.494 1.494 0 1 0 0-2.989 1.494 1.494 0 0 0 0 2.989z"
            stroke="#E31D1C"
            strokeWidth={0.625}
          />
          <path
            d="M10 9.449a1.494 1.494 0 1 0 0-2.989 1.494 1.494 0 0 0 0 2.989z"
            stroke="#FFD018"
            strokeWidth={0.625}
          />
          <path
            d="M10 9.449a1.494 1.494 0 1 0 0-2.989 1.494 1.494 0 0 0 0 2.989z"
            stroke="#4EDD00"
            strokeWidth={0.625}
          />
          <path
            d="M10 9.449a1.494 1.494 0 1 0 0-2.989 1.494 1.494 0 0 0 0 2.989z"
            stroke="#3D58DB"
            strokeWidth={0.625}
          />
          <path fill="#3D58DB" d="M8.136 7.636h3.909v1.136H8.136z" />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="m8.398 8.12.78-.775.238.387.167-.473.186.355.195-.27.252.27.231-.355.198.355.226-.27.53.563.095.212-3.098.157V8.12z"
            fill="#97C923"
          />
        </g>
      </g>
    </g>
  </svg>
);
export default FlagNi;
