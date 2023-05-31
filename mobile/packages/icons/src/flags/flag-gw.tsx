import React from 'react';
import Svg, { G, Mask, Path } from 'react-native-svg';

import type { FlagProps } from '../types';

const FlagGw = ({ style }: FlagProps) => (
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
      <Path d="M10 0h10v7.5H10V0z" fill="#FBCD17" />
      <Path d="M10 7.5h10V15H10V7.5z" fill="#0B9E7A" />
      <Path d="M0 0h10v15H0V0z" fill="#E11C1B" />
      <Path
        d="M5.582 9.129 3.403 10.64 4.1 8.052 2.5 6.399l2.165-.09.917-2.559.916 2.56H8.66L7.064 8.051l.8 2.435L5.581 9.13z"
        fill="#1D1D1D"
      />
    </G>
  </Svg>
);
export default FlagGw;
