import React from 'react';
import Svg, { G, Mask, Path } from 'react-native-svg';

import type { FlagProps } from '../types';

const FlagJm = ({ style }: FlagProps) => (
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
        fill="#093"
      />
      <Path
        d="m-.088-.65-1.38-1.14v18.58l1.38-1.14 9.086-7.5.789-.65-.789-.65-9.086-7.5z"
        fill="#272727"
        stroke="#FECA00"
        strokeWidth={1.688}
      />
      <Path
        d="m20.103-.663 1.366-1.077v18.48l-1.366-1.077-9.512-7.5-.84-.663.84-.663 9.512-7.5z"
        fill="#272727"
        stroke="#FECA00"
        strokeWidth={1.688}
      />
    </G>
  </Svg>
);
export default FlagJm;
