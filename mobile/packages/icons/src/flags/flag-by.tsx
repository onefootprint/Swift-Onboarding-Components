import React from 'react';
import Svg, { G, Mask, Path } from 'react-native-svg';

import type { FlagProps } from '../types';

const FlagBy = ({ style }: FlagProps) => (
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
        fill="#73BE4A"
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 0v10h20V0H0z"
        fill="#AF0100"
      />
      <Path fill="#F7FCFF" d="M0 0h3.75v15H0z" />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M.625 0a.625.625 0 1 1 0 1.25.625.625 0 0 1 0-1.25zm2.5 0a.625.625 0 1 1 0 1.25.625.625 0 0 1 0-1.25zM1.25 3.125a.625.625 0 1 0-1.25 0 .625.625 0 0 0 1.25 0zM3.125 2.5a.625.625 0 1 1 0 1.25.625.625 0 0 1 0-1.25zm0 8.75a.625.625 0 1 1 0 1.25.625.625 0 0 1 0-1.25zm-1.875.625a.625.625 0 1 0-1.25 0 .625.625 0 0 0 1.25 0zM.625 13.75a.625.625 0 1 1 0 1.25.625.625 0 0 1 0-1.25zm3.125.625a.625.625 0 1 0-1.25 0 .625.625 0 0 0 1.25 0zM1.875 12.5a.625.625 0 1 1 0 1.25.625.625 0 0 1 0-1.25zM2.5 1.875a.625.625 0 1 0-1.25 0 .625.625 0 0 0 1.25 0zm.069 5.65L3.75 8.75V10l.027.058-1.845-1.847L.274 10H0V8.75l1.24-1.232L0 6.278V5h.136l1.779 1.846 1.787-1.778L3.75 5v1.25L2.569 7.524zM1.875 3.75a.625.625 0 1 1 0 1.25.625.625 0 0 1 0-1.25zm.625 6.875a.625.625 0 1 0-1.25 0 .625.625 0 0 0 1.25 0z"
        fill="#D0181A"
      />
      <Path
        opacity={0.4}
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 0h1.25v1.25H0V0zm1.25 2.5H0v1.25h1.25V2.5zM0 5h1.25v1.25H0V5zm1.25 3.75H0V10h1.25V8.75zM0 11.25h1.25v1.25H0v-1.25zm1.25 2.5H0V15h1.25v-1.25zm2.5 0H2.5V15h1.25v-1.25zM3.75 0H2.5v1.25h1.25V0z"
        fill="#8F181A"
      />
    </G>
  </Svg>
);
export default FlagBy;
