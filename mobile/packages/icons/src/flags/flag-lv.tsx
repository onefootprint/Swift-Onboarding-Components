import React from 'react';
import Svg, { G, Mask, Path } from 'react-native-svg';

import type { FlagProps } from '../types';

const FlagLv = ({ style }: FlagProps) => (
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
      <Path d="M0 9h20v6H0V9z" fill="#C51918" />
      <Path d="M0 5h20v3.75H0V5z" fill="#F7FCFF" />
      <Path d="M0 0h20v6H0V0z" fill="#C51918" />
    </G>
  </Svg>
);
export default FlagLv;
