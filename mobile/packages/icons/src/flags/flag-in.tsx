import React from 'react';
import Svg, { G, Mask, Path } from 'react-native-svg';

import type { FlagProps } from '../types';

const FlagIn = ({ style }: FlagProps) => (
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
        d="M0 0v15h20V0H0z"
        fill="#F7FCFF"
      />
      <Mask
        id="prefix__b"
        maskUnits="userSpaceOnUse"
        x={0}
        y={0}
        width={20}
        height={15}
      >
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 0v15h20V0H0z"
          fill="#fff"
        />
      </Mask>
      <G mask="url(#prefix__b)" fillRule="evenodd" clipRule="evenodd">
        <Path d="M0 0v5h20V0H0z" fill="#FF8C1A" />
        <Path d="M0 10v5h20v-5H0z" fill="#5EAA22" />
        <Path
          d="M7.5 7.5a2.5 2.5 0 1 0 5 0 2.5 2.5 0 0 0-5 0zm4.375 0a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0z"
          fill="#3D58DB"
        />
        <Path
          d="m9.997 8.038-.522 1.921.306-1.967-1.258 1.543 1.079-1.673-1.776.898 1.666-1.089-1.989.098 1.965-.318-1.856-.719 1.925.51-1.403-1.413 1.55 1.248-.707-1.86.91 1.77L9.996 5l.11 1.987.91-1.77-.708 1.86 1.55-1.248-1.402 1.412 1.924-.509-1.856.72 1.965.317-1.988-.098 1.666 1.09-1.777-.899 1.08 1.673-1.258-1.543.305 1.967-.521-1.921z"
          fill="#3D58DB"
        />
      </G>
    </G>
  </Svg>
);
export default FlagIn;
