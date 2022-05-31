import React from 'react';

import type { FlagProps } from '../src/types';

const FlagHt = ({ className, testID }: FlagProps) => (
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
          d="M0 7.5V15h20V7.5H0z"
          fill="#E31D1C"
        />
        <path fill="#fff" d="M6.25 5h7.5v5h-7.5z" />
        <mask
          id="prefix__c"
          maskUnits="userSpaceOnUse"
          x={6}
          y={5}
          width={8}
          height={5}
        >
          <path fill="#fff" d="M6.25 5h7.5v5h-7.5z" />
        </mask>
        <g mask="url(#prefix__c)">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M6.25 9.111s1.8-.473 3.75-.444c1.95.029 3.75.555 3.75.555V10h-7.5v-.889z"
            fill="#279E19"
          />
          <path
            d="M10.046 5.563s-.582-.262-.988-.262-.632.4-.632.4"
            stroke="#026A16"
            strokeWidth={0.5}
          />
          <path
            d="M10.175 5.826s-.535-.192-.909-.192-.581.293-.581.293"
            stroke="#026A16"
            strokeWidth={0.5}
          />
          <path
            d="M10.175 6.048s-.396-.191-.672-.191c-.277 0-.43.292-.43.292"
            stroke="#026A16"
            strokeWidth={0.5}
          />
          <path
            d="M10.012 6.27s-.244-.191-.415-.191c-.17 0-.266.292-.266.292"
            stroke="#026A16"
            strokeWidth={0.5}
          />
          <path
            d="M9.992 6.422s-.098-.12-.167-.12c-.068 0-.106.184-.106.184m.235-.923s.582-.262.988-.262.632.4.632.4"
            stroke="#026A16"
            strokeWidth={0.5}
          />
          <path
            d="M9.825 5.826s.535-.192.909-.192.581.293.581.293"
            stroke="#026A16"
            strokeWidth={0.5}
          />
          <path
            d="M9.825 6.048s.396-.191.672-.191c.277 0 .43.292.43.292"
            stroke="#026A16"
            strokeWidth={0.5}
          />
          <path
            d="M9.988 6.27s.244-.191.415-.191c.17 0 .266.292.266.292"
            stroke="#026A16"
            strokeWidth={0.5}
          />
          <path
            d="M10.008 6.422s.098-.12.167-.12c.068 0 .106.184.106.184"
            stroke="#026A16"
            strokeWidth={0.5}
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M9.93 6.499s-.072.836-.072 1.176c0 .34.072 1.074.072 1.074h.183V7.675c0-.284-.107-1.176-.107-1.176H9.93z"
            fill="#FECA00"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M9.208 7.449s-.453.242-.453.96l.453.865h.816V7.848l-.816-.399z"
            fill="#C51918"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M8.537 6.766S7.48 7.08 7.48 8.234l1.37.117s-.076-.671.346-.981l-.66-.604z"
            fill="#0A328C"
          />
          <path
            d="m8.1 6.326 1.813 1.66M7.471 6.702l2.528 1.642M7.036 7.337l2.85 1.304"
            stroke="#FFD018"
            strokeWidth={0.5}
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="m7.487 8.225 1.891.212-.106.263h-.3l.204.15.46.107V8.7h.404v.546h-.864l-.33-.396s-.28.274-.55.274c-.272 0-.54-.09-.54-.388v-.208l-.269-.091v-.212z"
            fill="#FECA00"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.534 7.449s.452.242.452.96l-.452.865h-.817V7.848l.817-.399z"
            fill="#C51918"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M11.204 6.766s1.057.313 1.057 1.468l-1.369.117s.075-.671-.346-.981l.659-.604z"
            fill="#0A328C"
          />
          <path
            d="m11.64 6.326-1.812 1.66m2.442-1.284L9.742 8.344m2.964-1.007-2.85 1.304"
            stroke="#FFD018"
            strokeWidth={0.5}
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="m12.254 8.225-1.891.212.106.263h.3l-.204.15-.46.107V8.7H9.7v.546h.864l.331-.396s.278.274.55.274.54-.09.54-.388v-.208l.268-.091v-.212z"
            fill="#FECA00"
          />
        </g>
      </g>
    </g>
  </svg>
);

export default FlagHt;
