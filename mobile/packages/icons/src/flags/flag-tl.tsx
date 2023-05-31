import React from 'react';
import Svg, { G, Mask, Path } from 'react-native-svg';

import type { FlagProps } from '../types';

const FlagTl = ({ style }: FlagProps) => (
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
      <Path
        d="M0-.625h-.625v16.25h21.25V-.625H0z"
        fill="#E31D1C"
        stroke="#F7FCFF"
        strokeWidth={1.25}
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="m0 0 15 7.5L0 15V0z"
        fill="#FECA00"
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="m0 0 10 7.5L0 15V0z"
        fill="#272727"
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="m4.155 9.005-1.262 1.313-.132-1.866-1.61-.992 1.679-.526.274-1.85L4.267 6.55l1.695-.454-.877 1.734.852 1.673-1.782-.497z"
        fill="#F7FCFF"
      />
    </G>
  </Svg>
);
export default FlagTl;
