import React from 'react';
import Svg, { G, Mask, Path } from 'react-native-svg';

import type { FlagProps } from '../types';

const FlagAg = ({ style }: FlagProps) => (
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
        fill="#1B1B1B"
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="m10 8.75-1.39 2.375.034-2.623-2.54 1.657 1.453-2.35-3.188.61 2.584-1.613L3.75 6.25l3.203-.556L4.37 4.08l3.188.61-1.454-2.35 2.541 1.657-.035-2.623L10 3.75l1.39-2.375-.034 2.623 2.54-1.657-1.453 2.35 3.188-.61-2.584 1.613 3.203.556-3.203.556L15.63 8.42l-3.188-.61 1.454 2.35-2.541-1.657.035 2.623L10 8.75z"
        fill="#F9D313"
      />
      <Path fill="#F1F9FF" d="M3.75 8.75h12.5V15H3.75z" />
      <Path fill="#4A80E8" d="M1.25 6.25h17.5v2.5H1.25z" />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 3.75 10 15 20 3.75V15H0V3.75z"
        fill="#E31D1C"
      />
    </G>
  </Svg>
);
export default FlagAg;
