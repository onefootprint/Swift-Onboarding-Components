import React from 'react';
import Svg, { G, Mask, Path } from 'react-native-svg';

import type { FlagProps } from '../types';

const FlagGy = ({ style }: FlagProps) => (
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
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 0h20v15H0V0z"
        fill="#5EAA22"
      />
      <Path
        d="M.625 14.117V.883L19.372 7.5.625 14.117z"
        fill="#FECA00"
        stroke="#F7FCFF"
        strokeWidth={1.25}
      />
      <Path
        d="M-.625 14.972V.028L8.982 7.5l-9.607 7.472z"
        fill="#E11C1B"
        stroke="#272727"
        strokeWidth={1.25}
      />
    </G>
  </Svg>
);
export default FlagGy;
