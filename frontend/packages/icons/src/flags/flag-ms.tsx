import React from 'react';

import type { FlagProps } from '../types';

const FlagMs = ({ className, testID }: FlagProps) => (
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
        <path
          d="M16.205 13.477c-.795 0-1.341-.18-1.726-.488-.386-.31-.642-.771-.807-1.396-.166-.628-.234-1.398-.26-2.3-.018-.633-.014-1.32-.01-2.058l.002-.715h5.677c.1 1.788.132 3.515-.228 4.81-.187.671-.473 1.204-.89 1.569-.411.36-.974.579-1.758.579z"
          fill="#6DC2FF"
          stroke="#F7FCFF"
          strokeWidth={0.5}
        />
        <mask
          id="prefix__e"
          maskUnits="userSpaceOnUse"
          x={13}
          y={6}
          width={7}
          height={8}
        >
          <path
            d="M16.205 13.477c-.795 0-1.341-.18-1.726-.488-.386-.31-.642-.771-.807-1.396-.166-.628-.234-1.398-.26-2.3-.018-.633-.014-1.32-.01-2.058l.002-.715h5.677c.1 1.788.132 3.515-.228 4.81-.187.671-.473 1.204-.89 1.569-.411.36-.974.579-1.758.579z"
            fill="#fff"
            stroke="#fff"
            strokeWidth={0.5}
          />
        </mask>
        <g mask="url(#prefix__e)">
          <path fill="#2EBED7" d="M13.083 6.25h6.294v4.986h-6.294z" />
          <path fill="#A95601" d="M13 11.196h6.625v2.554H13z" />
          <path
            d="M16.716 8.415s-1.167.265-1.054 0c.113-.265.415-1.22.415-1.22"
            stroke="#FFC6B5"
            strokeWidth={0.625}
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M17.067 8.604s-.213-.13-.213-.368-.519-.327-.153-.698c.366-.371.524-.208.524 0s.294.698.294.698l-.452.368z"
            fill="#FFC6B5"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M16.478 6.453h-.58v.567H14.74v.568h1.16v4.946h.58V7.588h1.159V7.02h-1.16v-.567z"
            fill="#272727"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M17.726 12.7s-.21-.975-.21-1.643-.354-1.146-.253-1.5c.101-.353.344-.743.223-.985-.122-.242.118-.36-.223-.242-.341.118-.433-.118-.762 0-.33.118-.371.674-.371.832 0 .159.146 1.228.146 1.561 0 .334-.12 2.384.225 2.384s.722-.534.853-.534c.132 0 .372.128.372.128z"
            fill="#0C7C38"
          />
          <path
            clipRule="evenodd"
            d="M15.644 10.088c-.21 0-.017.49-.553.704-.536.214-.64.516-.472.516.169 0 1.503 1.5 1.503 1.5l.327-.507v-1.597s-.595-.616-.805-.616z"
            stroke="#FF9A06"
            strokeWidth={0.625}
          />
          <path
            d="M17.215 12.599s.25.536 0 .536"
            stroke="#979797"
            strokeWidth={0.625}
          />
          <path
            d="M17.134 8.619s-.11.602-.319.728c-.209.126-1.068.37-1.068.578 0 .208-.085.282-.085.282"
            stroke="#FFC6B5"
            strokeWidth={0.625}
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M16.717 7.377s.21.25.328.661c.118.412.459.552.459.36 0-.193.252-1.021 0-1.021h-.787z"
            fill="#FF9A06"
          />
        </g>
      </g>
    </g>
  </svg>
);

export default FlagMs;
