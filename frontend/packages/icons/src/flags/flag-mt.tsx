import React from 'react';

import type { FlagProps } from '../types';

const FlagMt = ({ className, testID }: FlagProps) => (
  <svg
    width={20}
    height={15}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    data-testid={testID}
    className={className}
    aria-hidden="true"
  >
    <path fill="#F7FCFF" d="M0 0h20v15H0z" />
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
      <mask id="prefix__b" fill="#fff">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M6.25 3.8h-2.5v1.87a.625.625 0 0 0-.48.63H1.25v2.5h2.082c.08.167.233.293.418.337V11.3h2.5V9.145a.626.626 0 0 0 .458-.345H8.75V6.3H6.77a.625.625 0 0 0-.52-.638V3.8z"
        />
      </mask>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.25 3.8h-2.5v1.87a.625.625 0 0 0-.48.63H1.25v2.5h2.082c.08.167.233.293.418.337V11.3h2.5V9.145a.626.626 0 0 0 .458-.345H8.75V6.3H6.77a.625.625 0 0 0-.52-.638V3.8z"
        fill="#A0A0A0"
      />
      <path
        d="M3.75 3.8v-.625h-.625V3.8h.625zm2.5 0h.625v-.625H6.25V3.8zm-2.5 1.87.144.608.481-.114V5.67H3.75zm-.48.63v.625h.647l-.022-.646-.625.021zm-2.02 0v-.625H.625V6.3h.625zm0 2.5H.625v.625h.625V8.8zm2.082 0 .562-.272-.17-.353h-.392V8.8zm.418.337h.625v-.494l-.48-.115-.145.609zm0 2.163h-.625v.625h.625V11.3zm2.5 0v.625h.625V11.3H6.25zm0-2.155-.104-.617-.521.089v.528h.625zm.458-.345v-.625h-.392l-.17.353.562.272zm2.042 0v.625h.625V8.8H8.75zm0-2.5h.625v-.625H8.75V6.3zm-1.98 0-.625-.021-.022.646h.646V6.3zm-.52-.638h-.625v.528l.52.089.105-.617zm-2.5-1.237h2.5v-1.25h-2.5v1.25zm.625 1.245V3.8h-1.25v1.87h1.25zm-.48.608-.29-1.216c-.55.13-.96.625-.96 1.216h1.25zm0 0h-1.25v.043l1.25-.042zm-2.645.647h2.02v-1.25H1.25v1.25zM1.875 8.8V6.3H.625v2.5h1.25zm1.457-.625H1.25v1.25h2.082v-1.25zm.562.353-1.125.544c.161.333.466.585.837.673l.288-1.217zm.481 2.772V9.137h-1.25V11.3h1.25zm1.875-.625h-2.5v1.25h2.5v-1.25zm-.625-1.53V11.3h1.25V9.145h-1.25zm.73.616a1.25 1.25 0 0 0 .916-.69l-1.126-.543.21 1.233zM8.75 8.175H6.708v1.25H8.75v-1.25zM8.125 6.3v2.5h1.25V6.3h-1.25zm-1.356.625H8.75v-1.25H6.77v1.25zm-.624-.647 1.25.043v-.043h-1.25zm0 0h1.25a1.25 1.25 0 0 0-1.04-1.232l-.21 1.233zM5.626 3.8v1.862h1.25V3.8h-1.25z"
        fill="#FECA00"
        mask="url(#prefix__b)"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 0h10v15H10V0z"
        fill="#E31D1C"
      />
    </g>
  </svg>
);
export default FlagMt;
