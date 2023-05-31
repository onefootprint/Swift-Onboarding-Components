import React from 'react';
import Svg, { G, Mask, Path } from 'react-native-svg';

import type { FlagProps } from '../types';

const FlagCf = ({ style }: FlagProps) => (
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
      <Path d="M0 0h20v3.75H0V0z" fill="#3D58DB" />
      <Path d="M0 3.75h20V7.5H0V3.75z" fill="#F7FCFF" />
      <Path d="M0 7.5h20v3.75H0V7.5z" fill="#73BE4A" />
      <Path d="M0 11.25h20V15H0v-3.75z" fill="#FFD018" />
      <Path
        d="M2.83 3.385 1.317 4.436l.484-1.8-1.113-1.15 1.507-.062.637-1.78.637 1.78h1.504l-1.11 1.212.556 1.694-1.587-.945z"
        fill="#FECA00"
      />
      <Path d="M8 0h4v15H8V0z" fill="#E11C1B" />
    </G>
  </Svg>
);
export default FlagCf;
