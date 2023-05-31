import React from 'react';
import Svg, { G, Mask, Path } from 'react-native-svg';

import type { FlagProps } from '../types';

const FlagSg = ({ style }: FlagProps) => (
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
        <Path d="M0 0v7.5h20V0H0z" fill="#E31D1C" />
        <Path
          d="M5.543 6.619s-1.766-.71-1.766-2.635c0-1.925 1.766-2.612 1.766-2.612-.859-.217-3.136-.023-3.136 2.612 0 2.635 2.243 3.131 3.136 2.635zm.452-.319.507-.305.518.305-.127-.596.42-.471h-.57l-.241-.558-.242.558-.571.024.422.447-.116.596zm2.348-.34-.506.306.115-.597-.422-.446.572-.024.241-.558.242.558h.57l-.42.47.126.597-.518-.306zM7.054 3.606l.507-.306.518.306-.127-.597.421-.47h-.57L7.56 1.98l-.242.557-.57.025.421.446-.116.597zm-1.198.908-.507.306.116-.597-.422-.446.571-.025.242-.557.242.557h.57l-.42.471.126.597-.518-.306zm2.842.279.507-.306.518.306-.127-.597.421-.471h-.57l-.242-.557-.242.557-.57.024.421.447-.116.597z"
          fill="#F1F9FF"
        />
      </G>
    </G>
  </Svg>
);
export default FlagSg;
