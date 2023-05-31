import React from 'react';
import Svg, { G, Mask, Path } from 'react-native-svg';

import type { FlagProps } from '../types';

const FlagSv = ({ style }: FlagProps) => (
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
      <G mask="url(#prefix__b)">
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 0v5h20V0H0zm0 10v5h20v-5H0z"
          fill="#3D58DB"
        />
        <Path
          d="M12.14 7.411a2.276 2.276 0 1 1-4.551 0 2.276 2.276 0 0 1 4.552 0z"
          stroke="#E8AA00"
          strokeWidth={0.625}
        />
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M8.632 6.039s-.596.98-.596 1.652c0 .673.713 1.518 1.834 1.518 1.094 0 1.88-.653 1.904-1.518.023-.864-.589-1.48-.589-1.48s.347 1.245.173 1.75c-.173.504-.733 1.114-1.488 1.037C9.116 8.92 8.4 7.99 8.4 7.69c0-.3.232-1.652.232-1.652z"
          fill="#1E601B"
        />
        <Path d="M8.85 7.705h2.005" stroke="#188396" strokeWidth={0.625} />
        <Path
          d="M9.037 7.379h1.725m-.106.378H9.121l.774-1.285.761 1.285z"
          stroke="#E8AA00"
          strokeWidth={0.625}
        />
      </G>
    </G>
  </Svg>
);
export default FlagSv;
