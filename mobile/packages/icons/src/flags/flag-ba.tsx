import React from 'react';
import Svg, { G, Mask, Path } from 'react-native-svg';

import type { FlagProps } from '../types';

const FlagBa = ({ style }: FlagProps) => (
  <Svg width={21} height={15} fill="none" style={style} aria-hidden={true}>
    <Mask
      id="prefix__a"
      maskUnits="userSpaceOnUse"
      x={0}
      y={0}
      width={22}
      height={15}
    >
      <Path fill="#fff" d="M0 0h21.25v15H0z" />
    </Mask>
    <G mask="url(#prefix__a)" fillRule="evenodd" clipRule="evenodd">
      <Path d="M0 0h20.25v15H0V0z" fill="#2E42A5" />
      <Path d="M6.25 0H19v15L6.25 0z" fill="#FECA00" />
      <Path
        d="m4.443 1.746-.735.386.14-.818-.594-.58.821-.119.368-.744.367.744.821.12-.594.58.14.817-.734-.386zm2.179 2.675-.735.386.14-.818-.594-.58.821-.118.368-.745.367.745.822.119-.595.58.14.817-.734-.386zm2.043 2.603-.735.386.14-.818-.594-.58.821-.119.368-.744.367.744.821.12-.594.58.14.817-.734-.386zm2.001 2.494-.735.387.14-.819-.594-.579.822-.12.367-.744.367.745.822.119-.595.58.14.818-.734-.387zm2.156 2.567-.735.387.14-.818-.594-.58.821-.12.367-.744.368.745.821.12-.594.579.14.818-.734-.387zm2.382 2.485-.735.386.14-.819-.594-.579.822-.12.367-.744.368.745.821.12-.594.579.14.818-.735-.387z"
        fill="#F7FCFF"
      />
    </G>
  </Svg>
);
export default FlagBa;
