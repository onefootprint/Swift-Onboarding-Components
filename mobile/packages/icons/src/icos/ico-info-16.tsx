import { useTheme } from '@onefootprint/styled';
import React from 'react';
import Svg, { ClipPath, Defs, G, Path } from 'react-native-svg';

import type { IconProps } from '../types';

const IcoInfo16 = ({ color = 'primary', style }: IconProps) => {
  const theme = useTheme();
  return (
    <Svg width={16} height={16} fill="none" style={style} aria-hidden={true}>
      <G clipPath="url(#prefix__a)">
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M2.35 7.994a5.644 5.644 0 1 1 11.288 0 5.644 5.644 0 0 1-11.288 0ZM7.994.95a7.044 7.044 0 1 0 0 14.088 7.044 7.044 0 0 0 0-14.088ZM8.9 5.375a.875.875 0 1 1-1.75 0 .875.875 0 0 1 1.75 0ZM7.994 8.15c.47 0 .85.38.85.85v1.7a.85.85 0 1 1-1.7 0V9c0-.47.38-.85.85-.85Z"
          fill={theme.color[color]}
        />
      </G>
      <Defs>
        <ClipPath id="prefix__a">
          <Path fill="#fff" d="M0 0h16v16H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
};
export default IcoInfo16;
