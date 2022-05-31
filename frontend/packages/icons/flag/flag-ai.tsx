import React from 'react';

import type { FlagProps } from '../src/types';

const FlagAi = ({ className, testID }: FlagProps) => (
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
          d="M16.219 13.477c-.628 0-1.052-.148-1.35-.394-.298-.249-.5-.624-.632-1.14-.132-.52-.186-1.158-.207-1.907a55.84 55.84 0 0 1-.009-1.711l.002-.555h4.453c.079 1.475.1 2.891-.184 3.953-.149.555-.375.99-.7 1.286-.32.291-.758.468-1.373.468z"
          fill="#fff"
          stroke="#E6E617"
          strokeWidth={0.5}
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M14.246 12.696c.373.834 1.027 1.25 1.96 1.25.928 0 1.583-.41 1.967-1.233l-3.927-.017z"
          fill="#82E5FF"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M14.653 9.75c0 .83.675 1.5 1.506 1.5s1.507-.67 1.507-1.5-.676-1.5-1.507-1.5c-.83 0-1.506.67-1.506 1.5zm2.388 0a.878.878 0 0 1-.882.875.878.878 0 0 1-.88-.875c0-.483.394-.875.88-.875.487 0 .882.392.882.875z"
          fill="#E18600"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M15.905 8.041s-.548.249-.429.716c.119.467.253.534.253.534s.194-1.012.976-1.012l-.8-.238zm-.997 2.521s.457.392.83.086c.373-.305.377-.455.377-.455s-1 .252-1.33-.456l.123.825zm2.742-.052s.017-.602-.455-.7c-.472-.098-.591-.007-.591-.007s.824.618.482 1.32l.564-.614z"
          fill="#E18600"
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
            fill="#F7FCFF"
          />
          <path
            d="m-.914 8.886 1.261.63L12.143-.583h-1.77L-.915 8.886z"
            fill="#F50100"
          />
          <path
            d="M12.503 8.125 10.306 9.52-.056 1.18-1.362-.434l2.647-.363 4.113 3.46 3.31 2.332 3.795 3.129z"
            fill="#F7FCFF"
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

export default FlagAi;
