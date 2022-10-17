import React from 'react';

import type { FlagProps } from '../types';

const FlagWs = ({ className, testID }: FlagProps) => (
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
        fill="#C51918"
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
      <g mask="url(#prefix__b)" fillRule="evenodd" clipRule="evenodd">
        <path d="M0 0v8.75h10V0H0z" fill="#2E42A5" />
        <path
          d="m2.229 4.857-.663.4.151-.78-.552-.584.747-.032.317-.729.316.73h.745l-.55.615.166.78-.677-.4zm5 0-.663.4.151-.78-.552-.584.747-.032.317-.729.316.73h.745l-.55.615.166.78-.677-.4zM4.666 2.586l-.624.377.143-.735-.52-.55.704-.03.297-.685.297.686h.702l-.518.58.156.734-.637-.377zm.675 2.68-.39.235.09-.46-.325-.343.44-.018.185-.429.186.429h.439l-.324.362.098.459-.399-.235zM4.63 8.018l-.935.564.213-1.102-.778-.824 1.054-.045.446-1.029.447 1.03H6.13l-.778.868.234 1.102-.956-.564z"
          fill="#FEFFFF"
        />
      </g>
    </g>
  </svg>
);
export default FlagWs;
