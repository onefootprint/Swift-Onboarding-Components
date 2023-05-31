import React from 'react';
import Svg, { G, Mask, Path } from 'react-native-svg';

import type { FlagProps } from '../types';

const FlagPa = ({ style }: FlagProps) => (
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
      <G mask="url(#prefix__b)" fillRule="evenodd" clipRule="evenodd">
        <Path
          d="M10 0v7.5h10V0H10zm4.388 11.969-1.439.89.559-1.495-1.223-1.132h1.483l.62-1.616.473 1.617h1.486l-1.07 1.131.524 1.495-1.413-.89z"
          fill="#E31D1C"
        />
        <Path
          d="m5.638 5.228-1.439.89.559-1.494-1.223-1.132h1.483l.62-1.617.473 1.617h1.486l-1.07 1.132.523 1.494-1.412-.89zM0 7.5V15h10V7.5H0z"
          fill="#2E42A5"
        />
      </G>
    </G>
  </Svg>
);
export default FlagPa;
