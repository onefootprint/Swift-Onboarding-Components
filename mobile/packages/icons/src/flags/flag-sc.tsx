import React from 'react';
import Svg, { G, Mask, Path } from 'react-native-svg';

import type { FlagProps } from '../types';

const FlagSc = ({ style }: FlagProps) => (
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
        d="M0 0v15h20V0H0z"
        fill="#2E42A5"
      />
      <Mask
        id="prefix__b"
        maskUnits="userSpaceOnUse"
        x={0}
        y={0}
        width={20}
        height={15}
      >
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 0v15h20V0H0z"
          fill="#fff"
        />
      </Mask>
      <G mask="url(#prefix__b)">
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 14.998 10.094-1.25H20.19L0 14.998z"
          fill="#FFD018"
        />
        <Path d="m0 14.998 21.54-8.124V-3.19L0 14.998z" fill="#E31D1C" />
        <Path d="m0 14.998 21.54-3.124V6.81L0 14.998z" fill="#F7FCFF" />
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 14.998h21.54V10.56L0 14.998z"
          fill="#5EAA22"
        />
      </G>
    </G>
  </Svg>
);
export default FlagSc;
