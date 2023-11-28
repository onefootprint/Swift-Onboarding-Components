import { useTheme } from 'styled-components';
import React from 'react';
import Svg, { Path } from 'react-native-svg';

import type { IconProps } from '../types';

const IcoChevronDown16 = ({ color = 'primary', style }: IconProps) => {
  const theme = useTheme();
  return (
    <Svg width={16} height={16} fill="none" style={style} aria-hidden={true}>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.24 5.7a.75.75 0 0 1 1.06.04L8 8.648l2.7-2.908a.75.75 0 1 1 1.1 1.02l-3.25 3.5a.75.75 0 0 1-1.1 0L4.2 6.76a.75.75 0 0 1 .04-1.06Z"
        fill={theme.color[color]}
      />
    </Svg>
  );
};
export default IcoChevronDown16;
