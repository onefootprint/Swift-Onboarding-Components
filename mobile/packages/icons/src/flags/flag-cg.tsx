import React from 'react';
import Svg, { G, Mask, Path } from 'react-native-svg';

import type { FlagProps } from '../types';

const FlagCg = ({ style }: FlagProps) => (
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
    <G mask="url(#prefix__a)" fillRule="evenodd" clipRule="evenodd">
      <Path d="M20 0v15H0L20 0z" fill="#FA1111" />
      <Path d="M0 15V0h20L0 15z" fill="#07A907" />
      <Path
        d="M18.432-3.625-.625 14.735l3.782 1.883L21.65-.133l-3.218-3.493z"
        fill="#FBCD17"
      />
    </G>
  </Svg>
);
export default FlagCg;
