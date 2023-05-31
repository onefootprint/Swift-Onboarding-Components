import React from 'react';
import Svg, { G, Mask, Path } from 'react-native-svg';

import type { FlagProps } from '../types';

const FlagGl = ({ style }: FlagProps) => (
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
        d="M0 7.5h20V15H0V7.5z"
        fill="#C51918"
      />
      <Mask
        id="prefix__b"
        maskUnits="userSpaceOnUse"
        x={0}
        y={7}
        width={20}
        height={8}
      >
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 7.5h20V15H0V7.5z"
          fill="#fff"
        />
      </Mask>
      <G mask="url(#prefix__b)">
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M7.5 12.5a5 5 0 1 0 0-10 5 5 0 0 0 0 10z"
          fill="#F7FCFF"
        />
      </G>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 0h20v7.5H0V0z"
        fill="#F7FCFF"
      />
      <Mask
        id="prefix__c"
        maskUnits="userSpaceOnUse"
        x={0}
        y={0}
        width={20}
        height={8}
      >
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 0h20v7.5H0V0z"
          fill="#fff"
        />
      </Mask>
      <G mask="url(#prefix__c)">
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M7.5 12.5a5 5 0 1 0 0-10 5 5 0 0 0 0 10z"
          fill="#C51918"
        />
      </G>
    </G>
  </Svg>
);
export default FlagGl;
