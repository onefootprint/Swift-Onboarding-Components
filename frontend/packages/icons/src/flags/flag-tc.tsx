import React from 'react';

import type { FlagProps } from '../types';

const FlagTc = ({ className, testID }: FlagProps) => (
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
          fillRule="evenodd"
          clipRule="evenodd"
          d="M13.154 6.27s.554 7.457 3.051 7.457c2.498 0 3.112-7.457 3.112-7.457h-6.163z"
          fill="#FECA00"
          stroke="#F7FCFF"
          strokeWidth={0.5}
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="m16.195 6.639.091-.104.434.277c.063-.098.174-.143.331-.136l-.158-.24.129-.07.3.362.03.01-.076-.47.15-.018.099.609h.007c.043 0 .09.02.14.053l.107-.662.15.018-.075.47.03-.01.3-.361.129.068-.159.241c.157-.007.269.038.332.136l.433-.277.092.104-.476.303c.007.034.01.072.01.112v.07l.657-.143.048.122-.705.25v.085l.668-.054.02.128-.688.1v.148l.69.114-.028.127-.662-.1v1.437h-.102V7.886L18 7.82c-.05.351-.106.794-.098.954.008.158.125.226.208.273.065.037.108.062.061.108-.106.104-.372.203-.638.203s-.528-.1-.585-.203c-.01-.02-.009-.018 0-.007.042.048.25.286.266-.374a3.622 3.622 0 0 0-.105-.94l-.346.052v1.452h-.101V7.902L15.998 8l-.028-.127.69-.114v-.148l-.688-.1.02-.128.669.054v-.085l-.706-.25.049-.122.657.144v-.07c0-.041.003-.079.01-.113l-.476-.303zm.869 1.032.006.02-.308.052v-.116l.302.044zm.006-.475a1.19 1.19 0 0 0-.014.016l-.294-.065v-.093c0-.018 0-.036.002-.052l.306.194zm.196-.193a2.2 2.2 0 0 0-.1.093l-.364-.232c.052-.088.152-.12.308-.097l.156.236zm.668.16.469-.299c-.051-.088-.152-.12-.308-.097l-.218.331c.02.022.04.044.057.065zm.158.061.35-.222a.592.592 0 0 1 .001.052v.093l-.35.077zm.14.24.211-.075v.057l-.21.017zm-.161.217.372-.054v.116l-.372-.062zm-1.309-.292v.057l.21.017-.21-.074z"
          fill="#CF6900"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M15.549 9.902s-.821 1.375-.821 2.208c0 0 .56.444 1.522.444s1.457-.444 1.457-.444a29.947 29.947 0 0 0-.732-2.208h-1.426z"
          fill="#00A727"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M15.589 9.522a.686.686 0 0 1 1.371 0v.469h-1.371v-.469z"
          fill="#E31D1C"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M13.45 8.02s1.083.224 1.083.576.437.48.544.384c.107-.095.862-.162.862-.62 0-.46.063-.584-.12-.876-.184-.291-.566-1.276-.654-.881-.088.394-.22.687-.465.451-.245-.235-.56-.733-.67-.451-.11.281.35.564 0 .564s-.103.018-.103.256c0 .239.041.463-.218.463-.26 0-.26.135-.26.135z"
          fill="#FF927F"
        />
      </g>
    </g>
  </svg>
);
export default FlagTc;
