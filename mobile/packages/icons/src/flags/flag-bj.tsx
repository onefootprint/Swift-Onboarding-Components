import React from 'react';
import Svg, { G, Mask, Path } from 'react-native-svg';

import type { FlagProps } from '../types';

const FlagBj = ({ style }: FlagProps) => (
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
        fill="#DD2C2B"
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 0v7.5h20V0H0z"
        fill="#FECA00"
      />
      <Path fill="#5EAA22" d="M0 0h9v15H0z" />
    </G>
  </Svg>
);
export default FlagBj;
