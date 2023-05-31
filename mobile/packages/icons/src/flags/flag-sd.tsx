import React from 'react';
import Svg, { G, Mask, Path } from 'react-native-svg';

import type { FlagProps } from '../types';

const FlagSd = ({ style }: FlagProps) => (
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
      <Path d="M0 0h20v15H0V0z" fill="#F7FCFF" />
      <Path d="M0 0v5h20V0H0z" fill="#E31D1C" />
      <Path d="M0 10v5h20v-5H0z" fill="#272727" />
      <Path d="m0 0 10 7.5L0 15V0z" fill="#5EAA22" />
    </G>
  </Svg>
);
export default FlagSd;
