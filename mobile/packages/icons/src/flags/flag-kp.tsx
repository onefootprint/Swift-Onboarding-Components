import React from 'react';
import Svg, { G, Path } from 'react-native-svg';

import type { FlagProps } from '../types';

const FlagKp = ({ style }: FlagProps) => (
  <Svg width={20} height={15} fill="none" style={style} aria-hidden={true}>
    <G mask="url(#prefix__KP_-_Korea_(North)__a)">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 0v15h20V0H0z"
        fill="#3D58DB"
      />
      <G mask="url(#prefix__KP_-_Korea_(North)__b)">
        <Path
          d="M0 3.125h-.625v8.75h21.25v-8.75H0z"
          fill="#C51918"
          stroke="#F7FCFF"
          strokeWidth={1.25}
        />
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M6.25 10.625a3.125 3.125 0 1 0 0-6.25 3.125 3.125 0 0 0 0 6.25z"
          fill="#F7FCFF"
        />
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M6.247 8.669 4.549 9.85l.6-1.98L3.5 6.62l2.068-.041.679-1.954.679 1.954 2.068.042-1.648 1.25.599 1.979-1.698-1.181z"
          fill="#C51918"
        />
      </G>
    </G>
  </Svg>
);
export default FlagKp;
