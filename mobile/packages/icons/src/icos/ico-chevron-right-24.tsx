import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoChevronRight24 = ({ color = 'primary', style }: IconProps) => {
  const theme = useTheme();
  return (
    <Svg width={24} height={24} fill="none" style={style} aria-hidden={true}>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.3 7.49a.75.75 0 0 1 1.06-.04l4.308 4a.75.75 0 0 1 0 1.1l-4.308 4a.75.75 0 1 1-1.02-1.1L13.056 12 9.34 8.55a.75.75 0 0 1-.04-1.06Z"
        fill={theme.color[color]}
      />
    </Svg>
  );
};
export default IcoChevronRight24;
