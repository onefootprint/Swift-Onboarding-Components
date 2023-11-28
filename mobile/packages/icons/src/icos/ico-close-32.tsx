import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoClose32 = ({ color = 'primary', style }: IconProps) => {
  const theme = useTheme();
  return (
    <Svg width={24} height={24} fill="none" style={style} aria-hidden={true}>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17.886 7.386a.9.9 0 1 0-1.272-1.272L12 10.727 7.386 6.114a.9.9 0 0 0-1.272 1.272L10.727 12l-4.613 4.614a.9.9 0 0 0 1.272 1.272L12 13.273l4.614 4.613a.9.9 0 0 0 1.272-1.272L13.273 12l4.613-4.614Z"
        fill={theme.color[color]}
      />
    </Svg>
  );
};
export default IcoClose32;
