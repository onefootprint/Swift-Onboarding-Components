import React from 'react';
import Svg, { G, Mask, Path } from 'react-native-svg';

import type { FlagProps } from '../types';

const FlagDe = ({ style }: FlagProps) => (
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
      <Path d="M0 10h20v5H0v-5z" fill="#FFD018" />
      <Path d="M0 5h20v5H0V5z" fill="#E31D1C" />
      <Path d="M0 0h20v5H0V0z" fill="#272727" />
    </G>
  </Svg>
);
export default FlagDe;
