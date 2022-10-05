import React from 'react';

import type { FlagProps } from '../types';

const FlagFk = ({ className, testID }: FlagProps) => (
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
          d="M16.219 12.227c-.628 0-1.052-.148-1.35-.394-.298-.249-.5-.624-.632-1.14-.132-.52-.186-1.158-.207-1.907a55.888 55.888 0 0 1-.009-1.712l.002-.554h4.453c.079 1.475.1 2.891-.184 3.953-.149.555-.375.99-.7 1.286-.32.291-.758.468-1.373.468z"
          fill="#6DC2FF"
          stroke="#F7FCFF"
          strokeWidth={0.5}
        />
        <mask
          id="prefix__e"
          maskUnits="userSpaceOnUse"
          x={13}
          y={6}
          width={6}
          height={7}
        >
          <path
            d="M16.219 12.227c-.628 0-1.052-.148-1.35-.394-.298-.249-.5-.624-.632-1.14-.132-.52-.186-1.158-.207-1.907a55.888 55.888 0 0 1-.009-1.712l.002-.554h4.453c.079 1.475.1 2.891-.184 3.953-.149.555-.375.99-.7 1.286-.32.291-.758.468-1.373.468z"
            fill="#fff"
            stroke="#fff"
            strokeWidth={0.5}
          />
        </mask>
        <g mask="url(#prefix__e)">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M15.326 8.492s-.247-.183-.352-.478c-.106-.296-.315-1.083-.315-1.15 0-.07-.279 0-.279 0s.004-.334.11-.334c.104 0 .108-.308.363-.23.255.077.456.362.716.362.26 0 1.346.083 1.52.083.175 0 .635.369.635.644 0 .276-.125.687-.224.687s-.223.24-.41.16c-.188-.078-.637-.24-1.038-.16-.401.082-.483.03-.483.16s-.243.256-.243.256z"
            fill="#E1E5E8"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M14.75 8.3h3.222l-.555.716H15.14l-.39-.717z"
            fill="#49801E"
          />
          <path
            d="M14.708 11.435s.557.199.79.175c.258-.027.486-.32.658-.32.172 0 .503.293.76.32.233.024.688-.175.688-.175m-3.507-.85c.192-.163.611-.175.611-.175s.557.2.79.175c.258-.027.486-.32.658-.32.172 0 .503.293.76.32.233.024.688-.175.688-.175s.254-.286.573.016"
            stroke="#fff"
            strokeWidth={0.667}
          />
          <path
            d="m14.038 9.706-.421-.516c.165-.135.442-.268.847-.415l.197-.01c.42.108.7.155.803.145.034-.004.091-.031.195-.1.294-.195.322-.21.497-.21.16 0 .192.015.526.195.062.033.085.045.119.061a.54.54 0 0 0 .148.054c.08.008.242-.03.467-.12.294-.267.665-.24.985.052.214.194.385.351.514.471l-.453.49a84.343 84.343 0 0 0-.51-.468c-.084-.077-.066-.077-.103-.036l-.116.081c-.35.148-.626.216-.85.193a1.103 1.103 0 0 1-.37-.116 3.222 3.222 0 0 1-.148-.076c-.16-.087-.222-.115-.21-.115.029 0-.01.022-.128.1-.19.126-.321.19-.496.207-.193.02-.494-.027-.934-.136-.286.108-.476.202-.559.27z"
            fill="#fff"
          />
        </g>
        <path
          d="M14.352 11.496s.615.59.244.988c-.372.4-.712.168-.712.168m4.272-1.156s-.615.59-.243.988c.37.4.711.168.711.168"
          stroke="#B85F3C"
          strokeWidth={0.625}
        />
        <path
          d="M13.95 11.97s1.06 1.013 2.362 1.013c1.303 0 2.351-.773 2.351-.773"
          stroke="#CB8B73"
          strokeWidth={0.625}
        />
      </g>
    </g>
  </svg>
);

export default FlagFk;
