import React from 'react';
import Svg, { G, Mask, Path } from 'react-native-svg';

import type { FlagProps } from '../types';

const FlagZa = ({ style }: FlagProps) => (
  <Svg width={20} height={15} fill="none" style={style} aria-hidden={true}>
    <Mask
      id="prefix__a"
      maskUnits="userSpaceOnUse"
      x={0}
      y={0}
      width={20}
      height={15}
    >
      <Path fill="#fff" d="M0 0h20v15H0z" />
    </Mask>
    <G mask="url(#prefix__a)">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 0h20v15H0V0z"
        fill="#F7FCFF"
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 0v5h20V0H0z"
        fill="#E31D1C"
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 10v5h20v-5H0z"
        fill="#3D58DB"
      />
      <Mask
        id="prefix__b"
        maskUnits="userSpaceOnUse"
        x={-2}
        y={-4.25}
        width={24}
        height={24}
        fill="#000"
      >
        <Path fill="#fff" d="M-2-4.25h24v24H-2z" />
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M9.643 6.25 0-1.25v17.5l9.643-7.5H20v-2.5H9.643z"
        />
      </Mask>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.643 6.25 0-1.25v17.5l9.643-7.5H20v-2.5H9.643z"
        fill="#5EAA22"
      />
      <Path
        d="m0-1.25.767-.987-2.017-1.569v2.556H0zm9.643 7.5-.768.987.339.263h.429V6.25zM0 16.25h-1.25v2.556l2.017-1.57L0 16.25zm9.643-7.5V7.5h-.429l-.339.263.768.987zM20 8.75V10h1.25V8.75H20zm0-2.5h1.25V5H20v1.25zM-.767-.263l9.642 7.5 1.535-1.974-9.643-7.5L-.767-.263zM1.25 16.25v-17.5h-2.5v17.5h2.5zm7.625-8.487-9.642 7.5 1.534 1.974 9.643-7.5-1.535-1.974zM20 7.5H9.643V10H20V7.5zm-1.25-1.25v2.5h2.5v-2.5h-2.5zM9.643 7.5H20V5H9.643v2.5z"
        fill="#F7FCFF"
        mask="url(#prefix__b)"
      />
      <Path
        d="m.375 3.25-1-.75v10l1-.75 5-3.75.667-.5-.667-.5-5-3.75z"
        fill="#272727"
        stroke="#FECA00"
        strokeWidth={1.25}
      />
    </G>
  </Svg>
);
export default FlagZa;
