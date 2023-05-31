import React from 'react';
import Svg, { G, Mask, Path } from 'react-native-svg';

import type { FlagProps } from '../types';

const FlagGbSct = ({ style }: FlagProps) => (
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
        fill="#0067C3"
      />
      <Path d="m-.75 1 20 15 1.5-2-20-15-1.5 2z" fill="#fff" />
      <Path d="m20.75 1-20 15-1.5-2 20-15 1.5 2z" fill="#fff" />
    </G>
  </Svg>
);
export default FlagGbSct;
