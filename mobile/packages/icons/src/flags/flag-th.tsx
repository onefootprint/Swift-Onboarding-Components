import React from 'react';
import Svg, { G, Mask, Path } from 'react-native-svg';

import type { FlagProps } from '../types';

const FlagTh = ({ style }: FlagProps) => (
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
        d="M0 10h20v5H0v-5zM0 0h20v3.75H0V0z"
        fill="#F50101"
      />
      <Path
        d="M0 4.063h-.938v6.875h21.876V4.062H0z"
        fill="#3D58DB"
        stroke="#fff"
        strokeWidth={1.875}
      />
    </G>
  </Svg>
);
export default FlagTh;
