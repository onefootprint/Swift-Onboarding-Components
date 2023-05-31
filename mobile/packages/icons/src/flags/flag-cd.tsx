import React from 'react';
import Svg, { G, Mask, Path } from 'react-native-svg';

import type { FlagProps } from '../types';

const FlagCd = ({ style }: FlagProps) => (
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
        fill="#3195F9"
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
          d="m-1.139 15.9.434.65.65-.434L22.608.988l.65-.433-.434-.65-1.388-2.08-.433-.65-.65.434L-2.31 12.737l-.65.433.434.65 1.387 2.08z"
          fill="#E31D1C"
          stroke="#FECA00"
          strokeWidth={1.563}
        />
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M3.082 5.379.903 6.89 1.6 4.302 0 2.649l2.165-.09L3.082 0l.916 2.56H6.16L4.564 4.301l.8 2.435L3.081 5.38z"
          fill="#FECA00"
        />
      </G>
    </G>
  </Svg>
);
export default FlagCd;
