import React from 'react';
import Svg, { G, Mask, Path } from 'react-native-svg';

import type { FlagProps } from '../types';

const FlagPy = ({ style }: FlagProps) => (
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
      <G mask="url(#prefix__b)">
        <Path
          d="M12.188 7.5a2.188 2.188 0 1 1-4.376 0 2.188 2.188 0 0 1 4.375 0z"
          stroke="#272727"
          strokeWidth={0.625}
        />
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 0v5h20V0H0z"
          fill="#F05234"
        />
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 10v5h20v-5H0z"
          fill="#3D58DB"
        />
        <Path
          d="M9.174 6.36s-.704.487-.45 1.432c.252.945 1.24.98 1.24.98"
          stroke="#73BE4A"
          strokeWidth={0.625}
        />
        <Path
          d="M10.73 6.36s.704.487.45 1.432c-.253.945-1.24.98-1.24.98"
          stroke="#73BE4A"
          strokeWidth={0.625}
        />
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M10.002 7.967a.625.625 0 1 0 0-1.25.625.625 0 0 0 0 1.25z"
          fill="#FBCD17"
        />
      </G>
    </G>
  </Svg>
);
export default FlagPy;
