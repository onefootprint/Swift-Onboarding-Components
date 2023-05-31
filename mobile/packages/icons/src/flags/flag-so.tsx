import React from 'react';
import Svg, { G, Mask, Path } from 'react-native-svg';

import type { FlagProps } from '../types';

const FlagSo = ({ style }: FlagProps) => (
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
      <Path d="M0 0h20v15H0V0z" fill="#56C6F5" />
      <Path
        d="m10.112 9.198-2.353 1.496.79-2.618L6.87 6.365l2.314-.05 1.023-2.585.933 2.619 2.308.04-1.735 1.742.81 2.49-2.411-1.423z"
        fill="#F7FCFF"
      />
    </G>
  </Svg>
);
export default FlagSo;
