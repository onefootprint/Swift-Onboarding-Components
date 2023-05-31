import React from 'react';
import Svg, { G, Mask, Path } from 'react-native-svg';

import type { FlagProps } from '../types';

const FlagMm = ({ style }: FlagProps) => (
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
      <Path d="M0 10h20v5H0v-5z" fill="#E31D1C" />
      <Path d="M0 5h20v5H0V5z" fill="#5EAA22" />
      <Path d="M0 0h20v5H0V0z" fill="#FFD018" />
      <Path
        d="m10.039 9.985-3.22 2.046L7.9 8.448l-2.296-2.34 3.166-.07 1.4-3.537 1.277 3.584 3.158.055-2.373 2.384 1.108 3.409-3.3-1.948z"
        fill="#F7FCFF"
      />
    </G>
  </Svg>
);
export default FlagMm;
