import React from 'react';

import type { FlagProps } from '../types';

const FlagGd = ({ className, testID }: FlagProps) => (
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
        d="M0 0h20v13.75c0 .69-.56 1.25-1.25 1.25H1.25C.56 15 0 14.44 0 13.75V0z"
        fill="#C51918"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.75 3.75h12.5v7.5H3.75v-7.5z"
        fill="#FECA00"
      />
      <mask
        id="prefix__b"
        maskUnits="userSpaceOnUse"
        x={3}
        y={3}
        width={14}
        height={9}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M3.75 3.75h12.5v7.5H3.75v-7.5z"
          fill="#fff"
        />
      </mask>
      <g mask="url(#prefix__b)" fillRule="evenodd" clipRule="evenodd">
        <path
          d="M3.75 3.75 10 7.5l-6.25 3.75v-7.5zm12.5 0L10 7.5l6.25 3.75v-7.5z"
          fill="#23875F"
        />
        <path d="M10 10a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" fill="#C51918" />
        <path
          d="m9.956 8.32-1.294.899.413-1.538-.95-.982 1.287-.053.544-1.521.544 1.52h1.285l-.948 1.036.474 1.447-1.355-.807z"
          fill="#FECA00"
        />
      </g>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="m5.485 2.776.708-.438.74.394-.259-.707.518-.506H6.49L6.193.776l-.298.743-.703.026.52.48-.227.751zm3.75 0 .708-.438.74.394-.259-.707.518-.506h-.702L9.943.776l-.298.743-.703.026.52.48-.227.751zm4.458-.438-.707.438.225-.751-.519-.48.703-.026.298-.743.297.743h.702l-.518.506.26.707-.741-.394zM5.485 13.855l.707-.44.741.395-.26-.707.519-.506H6.49l-.298-.742-.297.742-.703.026.519.48-.226.752zm4.457-.44-.707.44.226-.752-.52-.48.704-.026.297-.742.298.742h.702l-.518.506.259.707-.74-.394zm3.043.44.707-.44.741.395-.26-.707.519-.506h-.702l-.298-.742-.297.742-.703.026.519.48-.226.752z"
        fill="#FECA00"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.397 7.983s.336.3.52.401c.063-.24-.078-.782-.078-.782-.04-.13-.474-.363-.474-.363s-.122.41.032.744z"
        fill="#C51918"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.747 8.706s-.864-.403-.952-.975c-.088-.57.098-1.481.098-1.481s1.404.32 1.5 1.004c.095.684-.222 1.114-.222 1.114s-.324-.834-.63-.927c0 0 0 .827.206 1.265z"
        fill="#FECA00"
      />
    </g>
  </svg>
);
export default FlagGd;
