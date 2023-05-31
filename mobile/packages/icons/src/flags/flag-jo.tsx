import React from 'react';
import Svg, { G, Mask, Path } from 'react-native-svg';

import type { FlagProps } from '../types';

const FlagJo = ({ style }: FlagProps) => (
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
        <Path d="M0 0v5h20V0H0z" fill="#272727" />
        <Path d="M0 10v5h20v-5H0z" fill="#093" />
      </G>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 0v15l12.5-7.5L0 0z"
        fill="#E31D1C"
      />
      <Mask
        id="prefix__c"
        maskUnits="userSpaceOnUse"
        x={0}
        y={0}
        width={13}
        height={15}
      >
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 0v15l12.5-7.5L0 0z"
          fill="#fff"
        />
      </Mask>
      <G mask="url(#prefix__c)">
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="m5.626 8.67-1.17.705.268-1.377-.974-1.031 1.318-.056.558-1.286.558 1.286H7.5l-.971 1.087.292 1.377-1.195-.706z"
          fill="#F7FCFF"
        />
      </G>
    </G>
  </Svg>
);
export default FlagJo;
