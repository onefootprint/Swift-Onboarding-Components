import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoFaceid40 = ({ color = 'primary', style }: IconProps) => {
  const theme = useTheme();
  return (
    <Svg width={40} height={41} fill="none" style={style} aria-hidden={true}>
      <Path
        d="M14.684 7.167h-.89a7.126 7.126 0 0 0-7.127 7.126v.89M14.684 33h-.89a7.126 7.126 0 0 1-7.127-7.127v-.89M24.483 7.167h.89a7.127 7.127 0 0 1 7.127 7.126v.89M24.483 33h.89a7.127 7.127 0 0 0 7.127-7.127v-.89"
        stroke={theme.color[color]}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M16.911 16.52a.89.89 0 1 1-1.781 0 .89.89 0 0 1 1.781 0ZM24.038 16.52a.89.89 0 1 1-1.782 0 .89.89 0 0 1 1.782 0Z"
        stroke={theme.color[color]}
        strokeWidth={1.667}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M13.793 21.42s.446 4.453 5.79 4.453c5.345 0 5.79-4.454 5.79-4.454"
        stroke={theme.color[color]}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
export default IcoFaceid40;
