import React from 'react';
import Svg, { Defs, G, Mask, Path } from 'react-native-svg';

/* SVGR has dropped some elements not supported by react-native-svg: filter */
import type { FlagProps } from '../types';

const FlagAw = ({ style }: FlagProps) => (
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
        fill="#5BA3DA"
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
        <G filter="url(#prefix__c)">
          <Path
            d="M3.546 4.975.808 4.397l2.772-.549.8-2.868.633 2.845 2.474.575-2.445.575-.706 2.34-.791-2.34z"
            fill="#EF2929"
          />
          <Path
            d="M3.546 4.975.808 4.397l2.772-.549.8-2.868.633 2.845 2.474.575-2.445.575-.706 2.34-.791-2.34z"
            fill="red"
          />
        </G>
        <Path d="M20 9H0v1h20V9zm0 2H0v1h20v-1z" fill="#FAD615" />
      </G>
    </G>
    <Defs />
  </Svg>
);
export default FlagAw;
