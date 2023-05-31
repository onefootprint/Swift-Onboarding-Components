import React from 'react';
import Svg, { G, Mask, Path } from 'react-native-svg';

import type { FlagProps } from '../types';

const FlagMk = ({ style }: FlagProps) => (
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
        fill="#F50100"
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
      <G mask="url(#prefix__b)" fill="#FFD018">
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0-.026v2.552l8.75 3.72L2.035-.026H0zM10 7.5 11.875 0h-3.75L10 7.5zm0 0L8.125 15h3.75L10 7.5zM0 12.47v2.552h2.035L8.75 8.75 0 12.47zm20-9.93V-.01h-2.035L11.25 6.261 20 2.541zm0 12.496v-2.552l-8.75-3.72 6.715 6.272H20zm0-9.412L12.5 7.5 20 9.375v-3.75zM7.5 7.5 0 5.625v3.75L7.5 7.5z"
        />
        <Path
          d="M10 10.625a3.125 3.125 0 1 0 0-6.25 3.125 3.125 0 0 0 0 6.25z"
          stroke="#F50100"
          strokeWidth={1.25}
        />
      </G>
    </G>
  </Svg>
);
export default FlagMk;
