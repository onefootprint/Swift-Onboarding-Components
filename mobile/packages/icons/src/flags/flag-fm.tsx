import React from 'react';
import Svg, { G, Mask, Path } from 'react-native-svg';

import type { FlagProps } from '../types';

const FlagFm = ({ style }: FlagProps) => (
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
        fill="#63B3E1"
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
        fill="#F7FCFF"
      >
        <Path d="m10 4.563-1.102.579.21-1.227-.891-.87 1.232-.178L10 1.75l.551 1.117 1.232.179-.891.869.21 1.227L10 4.562zm0 7.5-1.102.579.21-1.227-.891-.87 1.232-.178L10 9.25l.551 1.117 1.232.179-.891.869.21 1.227-1.102-.58zM6.125 8.438l-1.102.579.21-1.227-.891-.87 1.232-.178.551-1.117.551 1.117 1.232.179-.891.869.21 1.227-1.102-.58zm7.625 0-1.102.579.21-1.227-.891-.87 1.232-.178.551-1.117.551 1.117 1.232.179-.891.869.21 1.227-1.102-.58z" />
      </G>
    </G>
  </Svg>
);
export default FlagFm;
