import React from 'react';
import Svg, { G, Mask, Path } from 'react-native-svg';

import type { FlagProps } from '../types';

const FlagGf = ({ style }: FlagProps) => (
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
      <Path fill="#5EAA22" d="M0 0h20v15H0z" />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="m0 0 20 15H0V0z"
        fill="#FECA00"
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="m9.957 9.004-2.179 1.511.696-2.588-1.599-1.653 2.165-.09.917-2.559.916 2.56h2.162l-1.596 1.742.8 2.435-2.282-1.358z"
        fill="#E21835"
      />
    </G>
  </Svg>
);
export default FlagGf;
