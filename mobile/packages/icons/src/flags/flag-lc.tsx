import React from 'react';
import Svg, { G, Mask, Path } from 'react-native-svg';

import type { FlagProps } from '../types';

const FlagLc = ({ style }: FlagProps) => (
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
      <Path d="M0 0h20v15H0V0z" fill="#7CCFF5" />
      <Path d="m10 2.5 5 10H5l5-10z" fill="#F7FCFF" />
      <Path d="m10 5 4.375 7.5h-8.75L10 5z" fill="#272727" />
      <Path d="m10 8.75 5 3.75H5l5-3.75z" fill="#FECA00" />
    </G>
  </Svg>
);
export default FlagLc;
