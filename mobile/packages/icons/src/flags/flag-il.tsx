import React from 'react';
import Svg, { G, Mask, Path } from 'react-native-svg';

import type { FlagProps } from '../types';

const FlagIl = ({ style }: FlagProps) => (
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
        fill="#F7FCFF"
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
      <G
        mask="url(#prefix__b)"
        fillRule="evenodd"
        clipRule="evenodd"
        fill="#3D58DB"
      >
        <Path d="M0 2.5v2.228h20V2.5H0zm0 7.717V12.5h20v-2.283H0z" />
        <Path d="M7.113 9.337h5.86l-2.9-5.013-2.96 5.013zm4.669-.688H8.317l1.75-2.963 1.715 2.963z" />
        <Path d="M6.932 5.578h5.993l-2.84 5.029-3.153-5.029zm4.816.688H8.175l1.88 2.998 1.693-2.998z" />
      </G>
    </G>
  </Svg>
);
export default FlagIl;
