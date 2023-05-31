import React from 'react';
import Svg, { G, Mask, Path } from 'react-native-svg';

import type { FlagProps } from '../types';

const FlagGm = ({ style }: FlagProps) => (
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
        d="M0 10h20v5H0v-5z"
        fill="#5EAA22"
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 0h20v5H0V0z"
        fill="#E31D1C"
      />
      <Path
        d="M0 5.25h-.75v4.5h21.5v-4.5H0z"
        fill="#3D58DB"
        stroke="#fff"
        strokeWidth={1.5}
      />
    </G>
  </Svg>
);
export default FlagGm;
