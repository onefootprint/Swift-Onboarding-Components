import React from 'react';
import Svg, { G, Mask, Path } from 'react-native-svg';

import type { FlagProps } from '../types';

const FlagGn = ({ style }: FlagProps) => (
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
      <Path d="M6 0h8v15H6V0z" fill="#FBCD17" />
      <Path d="M14 0h6v15h-6V0z" fill="#0B9E7A" />
      <Path d="M0 0h6v15H0V0z" fill="#E11C1B" />
    </G>
  </Svg>
);
export default FlagGn;
