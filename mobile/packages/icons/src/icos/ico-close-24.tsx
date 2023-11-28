import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoClose24 = ({ color = 'primary', style }: IconProps) => {
  const theme = useTheme();
  return (
    <Svg width={16} height={16} fill="none" style={style} aria-hidden={true}>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.136 5.136a.9.9 0 0 0-1.272-1.272L8 6.727 5.136 3.864a.9.9 0 0 0-1.272 1.272L6.727 8l-2.863 2.864a.9.9 0 0 0 1.272 1.272L8 9.273l2.864 2.863a.9.9 0 0 0 1.272-1.272L9.273 8l2.863-2.864Z"
        fill={theme.color[color]}
      />
    </Svg>
  );
};
export default IcoClose24;
