import React from 'react';
import Svg, { G, Mask, Path } from 'react-native-svg';

import type { FlagProps } from '../types';

const FlagHn = ({ style }: FlagProps) => (
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
      <G
        mask="url(#prefix__b)"
        fillRule="evenodd"
        clipRule="evenodd"
        fill="#4564F9"
      >
        <Path d="M0 0v5h20V0H0zm0 10v5h20v-5H0zm10.511-1.793-.734.387.14-.818-.595-.64h.822l.367-.804.368.804h.821l-.594.64.14.818-.735-.387zm-3.75-1.25-.734.387.14-.818-.595-.64h.822l.367-.804.368.804h.821l-.594.64.14.818-.735-.387zm0 2.5-.734.387.14-.818-.595-.64h.822l.367-.804.368.804h.821l-.594.64.14.818-.735-.387zm7.5-2.5-.734.387.14-.818-.595-.64h.822l.367-.804.368.804h.821l-.594.64.14.818-.735-.387zm0 2.5-.734.387.14-.818-.595-.64h.822l.367-.804.368.804h.821l-.594.64.14.818-.735-.387z" />
      </G>
    </G>
  </Svg>
);
export default FlagHn;
