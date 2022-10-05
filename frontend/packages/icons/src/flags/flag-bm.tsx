import React from 'react';

import type { FlagProps } from '../types';

const FlagBm = ({ className, testID }: FlagProps) => (
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
        fill="#AF0100"
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
          d="M13.755 7.5c0 3.68.348 4.957 2.445 4.957s2.67-1.854 2.494-4.957h-4.94z"
          fill="#F7FCFF"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M16.313 9.625c.586 0 1.062-.56 1.062-1.25s-.476-1.25-1.063-1.25c-.586 0-1.062.56-1.062 1.25s.476 1.25 1.063 1.25z"
          fill="#AF0100"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M14.246 11.446c.373.834 1.027 1.25 1.96 1.25.928 0 1.583-.41 1.967-1.233l-3.927-.017z"
          fill="#5EAA22"
        />
        <path
          d="m14.762 9.394-.349-.87c.64-.257 1.258-.387 1.85-.387.594 0 1.211.13 1.852.387l-.35.87c-.533-.214-1.033-.32-1.501-.32-.468 0-.968.106-1.502.32z"
          fill="#82B2CB"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M15.625 10a.625.625 0 1 0 0-1.25.625.625 0 0 0 0 1.25z"
          fill="#FECA00"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M16 11a.625.625 0 1 0 0-1.25.625.625 0 0 0 0 1.25z"
          fill="#8A4E22"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M15 10.5a.625.625 0 1 0 0-1.25.625.625 0 0 0 0 1.25zm2.125 0a.625.625 0 1 0 0-1.25.625.625 0 0 0 0 1.25zm-.437 1.375c.241 0 .437-.28.437-.625s-.196-.625-.438-.625c-.241 0-.437.28-.437.625s.196.625.438.625zm-1.5 0c.241 0 .437-.28.437-.625s-.196-.625-.438-.625c-.241 0-.437.28-.437.625s.196.625.438.625z"
          fill="#AF0100"
        />
        <path fill="#2E42A5" d="M0 0h11v9H0z" />
        <mask
          id="prefix__c"
          maskUnits="userSpaceOnUse"
          x={0}
          y={0}
          width={11}
          height={9}
        >
          <path fill="#fff" d="M0 0h11v9H0z" />
        </mask>
        <g mask="url(#prefix__c)">
          <path
            d="M-1.253 8.125 1.223 9.21l10.083-8.03 1.306-1.614-2.647-.363-4.113 3.46-3.31 2.332-3.795 3.129z"
            fill="#fff"
          />
          <path
            d="m-.914 8.886 1.261.63L12.143-.583h-1.77L-.915 8.886z"
            fill="#F50100"
          />
          <path
            d="M12.503 8.125 10.306 9.52-.056 1.18-1.362-.434l2.647-.363 4.113 3.46 3.31 2.332 3.795 3.129z"
            fill="#fff"
          />
          <path
            d="m12.418 8.67-1.261.63-5.023-4.323-1.489-.483-6.133-4.921H.283l6.13 4.804 1.628.58 4.377 3.714z"
            fill="#F50100"
          />
          <mask
            id="prefix__d"
            maskUnits="userSpaceOnUse"
            x={-1}
            y={-1}
            width={13}
            height={11}
            fill="#000"
          >
            <path fill="#fff" d="M-1-1h13v11H-1z" />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M6 0H5v4H0v1h5v4h1V5h5V4H6V0z"
            />
          </mask>
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M6 0H5v4H0v1h5v4h1V5h5V4H6V0z"
            fill="#F50100"
          />
          <path
            d="M5 0v-.938h-.938V0H5zm1 0h.938v-.938H6V0zM5 4v.938h.938V4H5zM0 4v-.938h-.938V4H0zm0 1h-.938v.938H0V5zm5 0h.938v-.938H5V5zm0 4h-.938v.938H5V9zm1 0v.938h.938V9H6zm0-4v-.938h-.938V5H6zm5 0v.938h.938V5H11zm0-1h.938v-.938H11V4zM6 4h-.938v.938H6V4zM5 .937h1V-.938H5V.938zM5.938 4V0H4.063v4h1.875zM0 4.938h5V3.063H0v1.874zM.938 5V4H-.938v1H.938zM5 4.062H0v1.875h5V4.063zM5.938 9V5H4.063v4h1.875zM6 8.062H5v1.876h1V8.062zM5.062 5v4h1.875V5H5.063zM11 4.062H6v1.875h5V4.063zM10.062 4v1h1.876V4h-1.876zM6 4.938h5V3.063H6v1.874zM5.062 0v4h1.875V0H5.063z"
            fill="#F7FCFF"
            mask="url(#prefix__d)"
          />
        </g>
      </g>
    </g>
  </svg>
);

export default FlagBm;
