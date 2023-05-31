import React from 'react';
import Svg, { G, Mask, Path } from 'react-native-svg';

import type { FlagProps } from '../types';

const FlagRo = ({ style }: FlagProps) => (
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
      <Path d="M6.25 0h7.5v15h-7.5V0z" fill="#FBCD17" />
      <Path d="M13.75 0H20v15h-6.25V0z" fill="#E11C1B" />
      <Path d="M0 0h6.25v15H0V0z" fill="#2E42A5" />
    </G>
  </Svg>
);
export default FlagRo;
