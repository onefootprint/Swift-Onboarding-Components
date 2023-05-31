import React from 'react';
import Svg, { G, Mask, Path } from 'react-native-svg';

import type { FlagProps } from '../types';

const FlagEt = ({ style }: FlagProps) => (
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
        fill="#FECA00"
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
      <G mask="url(#prefix__b)">
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 0v5h20V0H0z"
          fill="#5EAA22"
        />
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 10v5h20v-5H0z"
          fill="#E31D1C"
        />
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M10 11.25a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5z"
          fill="#2B77B8"
        />
        <Path
          clipRule="evenodd"
          d="m10 8.75-1.726.58.537-1.444-1.17-1.397h1.624L10 5l.735 1.489h1.66L11.19 7.886l.428 1.443L10 8.75z"
          stroke="#FECA00"
          strokeWidth={0.938}
        />
        <Path
          d="m9.81 7.522-1.303 2.725m1.098-3.072h-2.5m2.971.849 2.443 1.127m-1.915-1.73 1.769-1.936"
          stroke="#2B77B8"
          strokeWidth={0.625}
        />
      </G>
    </G>
  </Svg>
);
export default FlagEt;
