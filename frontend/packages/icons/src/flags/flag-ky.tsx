import React from 'react';

import type { FlagProps } from '../types';

const FlagKy = ({ className, testID }: FlagProps) => (
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
        d="M0 0h20v15H0V0z"
        fill="#2E42A5"
      />
    </g>
    <path fill="#2E42A5" d="M0 0h11v9H0z" />
    <mask
      id="prefix__b"
      maskUnits="userSpaceOnUse"
      x={0}
      y={0}
      width={11}
      height={9}
    >
      <path fill="#fff" d="M0 0h11v9H0z" />
    </mask>
    <g mask="url(#prefix__b)">
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
        id="prefix__c"
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
        mask="url(#prefix__c)"
      />
    </g>
    <g clipPath="url(#prefix__d)">
      <path
        d="M13.481 9.272V6.995h4.641v2.277c0 1.465-.543 2.434-1.096 3.037a3.777 3.777 0 0 1-.771.647 2.564 2.564 0 0 1-.345.181.291.291 0 0 1-.025.007 1.223 1.223 0 0 1-.108-.042 2.896 2.896 0 0 1-.285-.147 4.05 4.05 0 0 1-.83-.647c-.595-.604-1.181-1.572-1.181-3.036z"
        fill="#fff"
      />
      <path
        d="M13.481 9.272V6.995h4.641v2.277c0 1.465-.543 2.434-1.096 3.037a3.777 3.777 0 0 1-.771.647 2.564 2.564 0 0 1-.345.181.291.291 0 0 1-.025.007 1.223 1.223 0 0 1-.108-.042 2.896 2.896 0 0 1-.285-.147 4.05 4.05 0 0 1-.83-.647c-.595-.604-1.181-1.572-1.181-3.036z"
        stroke="#0B50A0"
        strokeWidth={0.1}
      />
      <path
        d="M13.481 9.272V6.995h4.641v2.277c0 1.465-.543 2.434-1.096 3.037a3.777 3.777 0 0 1-.771.647 2.564 2.564 0 0 1-.345.181.291.291 0 0 1-.025.007 1.223 1.223 0 0 1-.108-.042 2.896 2.896 0 0 1-.285-.147 4.05 4.05 0 0 1-.83-.647c-.595-.604-1.181-1.572-1.181-3.036z"
        stroke="#F7FCFF"
        strokeWidth={0.1}
      />
      <mask
        id="prefix__e"
        maskUnits="userSpaceOnUse"
        x={13}
        y={6}
        width={6}
        height={8}
      >
        <path
          d="M13.481 9.272V6.995h4.641v2.277c0 1.465-.543 2.434-1.096 3.037a3.777 3.777 0 0 1-.771.647 2.564 2.564 0 0 1-.345.181.291.291 0 0 1-.025.007 1.223 1.223 0 0 1-.108-.042 2.896 2.896 0 0 1-.285-.147 4.05 4.05 0 0 1-.83-.647c-.595-.604-1.181-1.572-1.181-3.036z"
          fill="#fff"
        />
        <path
          d="M13.481 9.272V6.995h4.641v2.277c0 1.465-.543 2.434-1.096 3.037a3.777 3.777 0 0 1-.771.647 2.564 2.564 0 0 1-.345.181.291.291 0 0 1-.025.007 1.223 1.223 0 0 1-.108-.042 2.896 2.896 0 0 1-.285-.147 4.05 4.05 0 0 1-.83-.647c-.595-.604-1.181-1.572-1.181-3.036z"
          stroke="#fff"
          strokeWidth={0.1}
        />
      </mask>
      <g mask="url(#prefix__e)">
        <path fill="#F50100" d="M13.126 6.633h5.4v2.125h-5.4z" />
        <path
          d="M15.534 9.195c.172 0 .518-.195.604-.24.317-.197.548-.016.735.075.201.09.576.196.806 0 .23-.196.36-.181.519-.181.028-.226.028-.452.028-.708V7.96c-.201-.045-.302.015-.518.21-.216.197-.46.151-.778.03-.302-.135-.604-.376-.907 0-.086.106-.288.257-.49.257-.215 0-.403-.15-.489-.256-.317-.377-.605-.136-.907 0-.317.12-.576.166-.792-.03-.202-.196-.303-.256-.519-.211v.18c0 .257.015.483.044.709.158 0 .273-.015.504.18.23.197.619.091.806 0 .202-.09.432-.27.749-.075.086.046.417.241.605.241z"
          fill="#F50100"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M14.077 7.601s.13.006.284.172c.154.166.721.06.721-.04s-.344-.16-.212-.33c.133-.171.356-.172.536-.083.052 0 .046.585.164.553.373-.102.975-.303 1.152-.217.232.114.41.086.35-.077-.058-.163-.21-.265-.502-.176-.293.089-.224.176-.476.176-.253 0-.686.142-.494-.176.173-.286.379-.291.457-.171.04.061-.287.197-.287.26 0 .087.843-.171.952-.171.108 0 .405-.007.435.082.03.089.21.17.072.253-.137.083-.363.135-.207.242.155.106.549.155.566.265.017.11.187.276.119.276s-.191.156-.305.108c-.115-.047-.128-.089-.019-.127.11-.039.11-.2.019-.2-.09 0-.083-.012-.29-.07-.205-.056-.478-.119-.461 0 .016.12.155.377-.092.402-.248.024-.363.122-.412.043-.048-.079-.22-.184-.085-.218.136-.034.265.115.314.09.049-.024.154-.11.061-.213-.092-.103-.272-.107-.13-.184.14-.077.056-.135-.213.024-.27.16-.42.295-.656.276-.237-.019-.343.069-.42.043-.075-.026-.446.285-.553.206-.106-.079-.45-.109-.389-.206.062-.097.146-.147.238-.097.093.05.185.1.248.05.062-.05.26-.284.215-.318-.046-.035-.206-.093-.463-.093s-.263-.178-.324-.26c-.06-.08.087-.094.087-.094z"
          fill="#FFD100"
        />
        <path
          d="M15.534 10.695c.172 0 .518-.195.604-.24.317-.197.548-.016.735.075.201.09.576.196.806 0 .23-.196.36-.181.519-.181.028-.226.028-.452.028-.708V9.46c-.201-.045-.302.015-.518.21-.216.197-.46.151-.778.03-.302-.135-.604-.376-.907 0-.086.106-.288.257-.49.257-.215 0-.403-.15-.489-.256-.317-.377-.605-.136-.907 0-.317.12-.576.166-.792-.03-.202-.196-.303-.256-.519-.211v.18c0 .257.015.483.044.709.158 0 .273-.015.504.18.23.197.619.091.806 0 .202-.09.432-.27.749-.075.086.046.417.241.605.241zm0 1.438c.172 0 .518-.196.604-.241.317-.196.548-.015.735.075.201.09.576.196.806 0 .23-.196.36-.18.519-.18.028-.227.028-.453.028-.709v-.18c-.201-.046-.302.014-.518.21-.216.196-.46.15-.778.03-.302-.135-.604-.376-.907 0-.086.106-.288.257-.49.257-.215 0-.403-.151-.489-.257-.317-.376-.605-.135-.907 0-.317.12-.576.166-.792-.03-.202-.196-.303-.256-.519-.21v.18c0 .256.015.482.044.708.158 0 .273-.015.504.181.23.196.619.09.806 0 .202-.09.432-.271.749-.075.086.045.417.241.605.241zm0 1.437c.172 0 .518-.195.604-.24.317-.197.548-.016.735.075.201.09.576.196.806 0 .23-.196.36-.181.519-.181.028-.226.028-.452.028-.708v-.181c-.201-.046-.302.015-.518.21-.216.197-.46.151-.778.03-.302-.135-.604-.376-.907 0-.086.106-.288.257-.49.257-.215 0-.403-.15-.489-.256-.317-.377-.605-.136-.907 0-.317.12-.576.166-.792-.03-.202-.196-.303-.256-.519-.211v.18c0 .257.015.483.044.709.158 0 .273-.015.504.18.23.197.619.091.806 0 .202-.09.432-.27.749-.075.086.046.417.241.605.241z"
          fill="#0B50A0"
        />
        <path
          d="m15.871 11.656-.025-.013-.024.014-.27.16.079-.333.007-.028-.022-.02-.262-.242h.372l.012-.033.113-.306.133.309.013.03h.313l-.231.244-.02.022.009.029.11.329-.307-.162zm-1.2-1.25-.025-.013-.024.014-.27.16.079-.333.007-.028-.022-.02-.262-.242h.372l.012-.033.113-.306.133.309.013.03h.313l-.231.244-.02.022.009.029.11.329-.307-.162zm2.4 0-.025-.013-.024.014-.27.16.079-.333.007-.028-.022-.02-.262-.242h.372l.012-.033.113-.306.133.309.013.03h.313l-.231.244-.02.022.009.029.11.329-.307-.162z"
          fill="#059334"
          stroke="#FFD100"
          strokeWidth={0.1}
        />
      </g>
    </g>
    <path
      d="M13.029 12.967c.055.123.45.284.91.077.311-.146.514-.354.706-.722.056-.092.083-.207-.045-.277-.102-.061-.267-.13-.34-.192-.037-.03-.074-.053-.101-.076.018.015.036.03.055.053.183.185-.01.453-.212.615-.147.115-.413.4-.799.13-.082-.061-.275.192-.174.392zm5.585 0c-.064.123-.46.284-.91.077-.312-.146-.514-.354-.716-.722-.046-.092-.073-.207.055-.277.101-.061.267-.13.34-.192.037-.03.064-.053.101-.076a.364.364 0 0 0-.055.053c-.184.185.01.453.202.615.147.115.423.4.808.13.083-.061.267.192.175.392z"
      fill="#FFD100"
    />
    <path
      d="M15.821 13.627c.735 0 1.865-.276 2.472-1.244.1-.161 0-.245-.12-.3a1.419 1.419 0 0 1-.367-.222c.147.123.12.207.018.346-.469.652-1.112.983-2.003.983-.89 0-1.534-.33-2.002-.983-.101-.139-.129-.223.009-.346-.074.07-.239.177-.368.223-.119.053-.22.138-.119.3.606.967 1.745 1.243 2.48 1.243z"
      fill="#FFD100"
    />
    <path
      d="M14.122 12.33c-.019-.077-.138-.047-.175.046a1.182 1.182 0 0 1-.128-.17c-.11-.138-.129-.23.027-.36.074-.062.22-.13.322-.054.211.146.1.384-.046.537zm3.39 0c.018-.077.147-.047.183.046.046-.054.092-.108.129-.17.11-.138.129-.23-.037-.36-.064-.062-.211-.13-.321-.054-.202.146-.101.384.046.537z"
      fill="#F50100"
    />
    <path
      d="M14.88 5.923c-.071-.102-.267-.148-.35-.057-.03.023-.072.023-.103.034-.051 0-.117.03-.097.143.056 0 .056.029.087.029.02-.012.074.197.177.186a.39.39 0 0 1 .235.076c.031.034.072.125.02.171a.247.247 0 0 0 0 .354c.135.114.475.285.857-.046.371-.32.949-.137.99-.023.051.114.072.183.082.24.01.045.29.114.33.148.052.034.124.023.104-.08-.042-.32-.217-.365-.238-.513.104.011.176.011.217-.034.03-.046.072-.126.113-.149.031-.022.031-.045-.01-.034-.052.012-.082.034-.175.023-.22-.026-.166-.892-.892-1.06-.448-.104-1.008.61-1.161.68a.077.077 0 0 1-.01.003.213.213 0 0 1-.175-.09z"
      fill="#059334"
    />
    <defs>
      <clipPath id="prefix__d">
        <path fill="#fff" transform="translate(13.426 6.945)" d="M0 0h5v7H0z" />
      </clipPath>
    </defs>
  </svg>
);
export default FlagKy;
