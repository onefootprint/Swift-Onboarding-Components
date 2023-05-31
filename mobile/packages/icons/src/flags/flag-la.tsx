import React from 'react';
import Svg, { G, Mask, Path } from 'react-native-svg';

import type { FlagProps } from '../types';

const FlagLa = ({ style }: FlagProps) => (
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
      <Path d="M0 5h20v5H0V5z" fill="#2E42A5" />
      <Path d="M0 0h20v5H0V0z" fill="#E31D1C" />
      <Path
        d="M10 9.837a2.344 2.344 0 1 0 0-4.687 2.344 2.344 0 0 0 0 4.687z"
        fill="#F7FCFF"
      />
    </G>
  </Svg>
);
export default FlagLa;
