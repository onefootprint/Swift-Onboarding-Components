import React from 'react';
import Svg, { G, Mask, Path } from 'react-native-svg';

import type { FlagProps } from '../types';

const FlagGh = ({ style }: FlagProps) => (
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
      <Path d="M0 10h20v5H0v-5z" fill="#5EAA22" />
      <Path d="M0 5h20v5H0V5z" fill="#FECA00" />
      <Path d="M0 0h20v5H0V0z" fill="#E11C1B" />
      <Path
        opacity={0.9}
        d="m10.047 9.057-2.178 1.51.696-2.588-1.6-1.653 2.166-.09.916-2.558.916 2.559h2.162L11.53 7.979l.799 2.436-2.282-1.358z"
        fill="#1D1D1D"
      />
    </G>
  </Svg>
);
export default FlagGh;
