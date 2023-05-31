import React from 'react';
import Svg, { G, Mask, Path } from 'react-native-svg';

import type { FlagProps } from '../types';

const FlagBl = ({ style }: FlagProps) => (
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
      <Path d="M14 0h6v15h-6V0z" fill="#F50100" />
      <Path d="M0 0h8v15H0V0z" fill="#2E42A5" />
      <Path d="M6 0h8v15H6V0z" fill="#F7FCFF" />
    </G>
  </Svg>
);
export default FlagBl;
