import React from 'react';
import Svg, { G, Mask, Path } from 'react-native-svg';

import type { FlagProps } from '../types';

const FlagEn = ({ style }: FlagProps) => (
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
      <Path fill="#F7FCFF" d="M0 0h20v15H0z" />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11 0H8.5v6.25H0v2.5h8.5V15H11V8.75h9v-2.5h-9V0z"
        fill="#F50302"
      />
    </G>
  </Svg>
);
export default FlagEn;
