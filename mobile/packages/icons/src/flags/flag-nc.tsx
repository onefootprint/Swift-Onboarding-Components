import React from 'react';
import Svg, { G, Mask, Path } from 'react-native-svg';

import type { FlagProps } from '../types';

const FlagNc = ({ style }: FlagProps) => (
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
      <Path d="M13.75 0H20v15h-6.25V0z" fill="#F50100" />
      <Path d="M0 0h7.5v15H0V0z" fill="#2E42A5" />
      <Path d="M6.25 0h7.5v15h-7.5V0z" fill="#F7FCFF" />
    </G>
  </Svg>
);
export default FlagNc;
