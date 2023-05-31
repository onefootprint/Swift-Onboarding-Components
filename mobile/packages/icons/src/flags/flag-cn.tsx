import React from 'react';
import Svg, { G, Mask, Path } from 'react-native-svg';

import type { FlagProps } from '../types';

const FlagCn = ({ style }: FlagProps) => (
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
      <Path d="M0 0h20v15H0V0z" fill="#E31D1C" />
      <Path
        d="M4.446 6.097 2.013 8.004l.93-2.884-1.624-1.5 2.198-.08.93-2.322.929 2.321h2.193L5.95 5.12l.738 2.884-2.242-1.907zm4.939-2.24-1.02.617.232-1.203-.85-.9 1.151-.049.487-1.123.487 1.123h1.15l-.849.949.256 1.203-1.044-.617z"
        fill="#FECA00"
      />
      <Path
        d="m10.635 6.357-1.02.617.232-1.203-.85-.9 1.151-.049.487-1.123.487 1.123h1.15l-.849.949.256 1.203-1.044-.617z"
        fill="#FECA00"
      />
      <Path
        d="m9.385 8.857-1.02.617.232-1.203-.85-.9 1.151-.049.487-1.123.487 1.123h1.15l-.849.949.256 1.203-1.044-.617z"
        fill="#FECA00"
      />
      <Path
        d="m6.885 10.107-1.02.617.232-1.203-.85-.9 1.151-.049.487-1.123.487 1.123h1.15l-.849.949.256 1.203-1.044-.617z"
        fill="#FECA00"
      />
    </G>
  </Svg>
);
export default FlagCn;
