import React from 'react';
import Svg, { G, Mask, Path } from 'react-native-svg';

import type { FlagProps } from '../types';

const FlagUy = ({ style }: FlagProps) => (
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
          fill="#2E42A5"
          d="M0 2.5h20v1.25H0zM0 5h20v1.25H0zm0 2.5h20v1.25H0zM0 10h20v1.25H0zm0 2.5h20v1.25H0z"
        />
        <Path fill="#F7FCFF" d="M0 0h10v8.75H0z" />
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M5.767 6.898s-.638 1.324-1.2 1.596c.242-.607.332-1.847.332-1.847s-1.458.578-1.97.473c.616-.43 1.47-1.226 1.47-1.226s-1.887-.617-1.84-.88c.851.153 2.022-.013 2.022-.013s-1.323-1.587-1.19-1.705C3.595 3.492 5.18 4.32 5.18 4.32s.115-1.412.456-1.888c.04.336.52 1.858.52 1.858s.963-.964 1.498-.964c-.235.291-.791 1.57-.791 1.57s1.385-.022 1.912.238c-.638.09-1.756.652-1.756.652S8.475 6.89 8.342 7.12c-.781-.383-1.685-.51-1.685-.51s.25 1.536.048 1.884c-.197-.512-.938-1.596-.938-1.596z"
          fill="#FFD018"
          stroke="#F19900"
          strokeOpacity={0.98}
          strokeWidth={0.5}
        />
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M5.683 6.182a.625.625 0 1 0 0-1.25.625.625 0 0 0 0 1.25z"
          fill="#FFD018"
          stroke="#F19900"
          strokeOpacity={0.98}
          strokeWidth={0.5}
        />
      </G>
    </G>
  </Svg>
);
export default FlagUy;
