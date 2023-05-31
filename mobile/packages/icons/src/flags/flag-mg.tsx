import React from 'react';
import Svg, { G, Mask, Path } from 'react-native-svg';

import type { FlagProps } from '../types';

const FlagMg = ({ style }: FlagProps) => (
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
      <Path d="M7 7.5h13V15H7V7.5z" fill="#78D843" />
      <Path d="M7 0h13v7.5H7V0z" fill="#EA1A1A" />
      <Path d="M0 0h8v15H0V0z" fill="#F7FCFF" />
    </G>
  </Svg>
);
export default FlagMg;
