import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoFaceid24 = ({ color = 'primary', style }: IconProps) => {
  const theme = useTheme();
  return (
    <Svg width={24} height={24} fill="none" style={style} aria-hidden={true}>
      <Path
        d="M8.81 4h-.534A4.276 4.276 0 0 0 4 8.276v.534M8.81 19.5h-.534A4.276 4.276 0 0 1 4 15.224v-.534M14.69 4h.534A4.276 4.276 0 0 1 19.5 8.276v.534M14.69 19.5h.534a4.276 4.276 0 0 0 4.276-4.276v-.534"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M10.146 9.612a.534.534 0 1 1-1.068 0 .534.534 0 0 1 1.069 0ZM14.422 9.612a.534.534 0 1 1-1.069 0 .534.534 0 0 1 1.07 0Z"
        stroke={theme.color[color]}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8.276 12.552s.267 2.672 3.474 2.672c3.207 0 3.474-2.672 3.474-2.672"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
export default IcoFaceid24;
