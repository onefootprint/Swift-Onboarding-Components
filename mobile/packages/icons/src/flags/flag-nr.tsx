import React from 'react';
import Svg, { G, Mask, Path } from 'react-native-svg';

import type { FlagProps } from '../types';

const FlagNr = ({ style }: FlagProps) => (
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
        fill="#2E42A5"
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
        <Path d="M0 5v2.5h20V5H0z" fill="#FECA00" />
        <Path
          d="m5.519 12.237-.966 1.254-.045-1.582-1.518.446.894-1.305-1.49-.532 1.49-.53-.894-1.306 1.518.446.045-1.582.966 1.254.965-1.254.045 1.582 1.518-.446-.894 1.305 1.49.531-1.49.532.894 1.305-1.518-.446-.045 1.582-.965-1.254z"
          fill="#F7FCFF"
        />
      </G>
    </G>
  </Svg>
);
export default FlagNr;
