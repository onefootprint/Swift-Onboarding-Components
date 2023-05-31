import React from 'react';
import Svg, { G, Mask, Path } from 'react-native-svg';

import type { FlagProps } from '../types';

const FlagCu = ({ style }: FlagProps) => (
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
        fill="#3D58DB"
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
          d="M0 5h-1.25v5h22.5V5H0z"
          fill="#3D58DB"
          stroke="#F7FCFF"
          strokeWidth={2.5}
        />
      </G>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 0v15l11.25-7.5L0 0z"
        fill="#E31D1C"
      />
      <Mask
        id="prefix__c"
        maskUnits="userSpaceOnUse"
        x={0}
        y={0}
        width={12}
        height={15}
      >
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 0v15l11.25-7.5L0 0z"
          fill="#fff"
        />
      </Mask>
      <G mask="url(#prefix__c)">
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="m4.18 8.886-2.295 1.21 1.117-2.433-1.424-1.3 1.758-.065.844-2.2.644 2.2h1.754l-1.17 1.365.931 2.434-2.16-1.211z"
          fill="#F7FCFF"
        />
      </G>
    </G>
  </Svg>
);
export default FlagCu;
