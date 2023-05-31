import React from 'react';
import Svg, { G, Mask, Path } from 'react-native-svg';

import type { FlagProps } from '../types';

const FlagSy = ({ style }: FlagProps) => (
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
      <Path d="M0 0h20v15H0V0z" fill="#F7FCFF" />
      <Path
        d="m5.626 8.67-1.17.705.268-1.377-.974-1.031 1.318-.056.558-1.286.558 1.286H7.5l-.971 1.087.292 1.377-1.195-.706zm8.75 0-1.169.705.267-1.377-.974-1.031 1.318-.056.558-1.286.558 1.286h1.316l-.971 1.087.292 1.377-1.195-.706z"
        fill="#409100"
      />
      <Path d="M0 0v5h20V0H0z" fill="#E31D1C" />
      <Path d="M0 10v5h20v-5H0z" fill="#272727" />
    </G>
  </Svg>
);
export default FlagSy;
