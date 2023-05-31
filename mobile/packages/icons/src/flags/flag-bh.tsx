import React from 'react';
import Svg, { G, Mask, Path } from 'react-native-svg';

import type { FlagProps } from '../types';

const FlagBh = ({ style }: FlagProps) => (
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
    <G mask="url(#prefix__a)">
      <Path fill="#E31D1C" d="M0 0h20v15H0z" />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 0h4.25L7.5 1.25 4.25 2.5 7.5 3.75 4.25 5 7.5 6.25 4.25 7.5 7.5 8.75 4.25 10l3.25 1.25-3.25 1.25 3.25 1.25L4.25 15H0V0z"
        fill="#F7FCFF"
      />
    </G>
  </Svg>
);
export default FlagBh;
