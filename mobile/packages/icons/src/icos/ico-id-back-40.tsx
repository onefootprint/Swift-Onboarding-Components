import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoIdBack40 = ({ color = 'primary', style }: IconProps) => {
  const theme = useTheme();
  return (
    <Svg width={40} height={40} fill="none" style={style} aria-hidden={true}>
      <Rect
        width={30}
        height={30}
        rx={5}
        transform="matrix(1 0 0 -1 5 35)"
        stroke={theme.color[color]}
        strokeWidth={3.5}
      />
      <Rect x={10} y={10.5} width={20} height={2.4} rx={1.2} fill={theme.color[color]} />
      <Rect x={16} y={15.5} width={14} height={2.4} rx={1.2} fill={theme.color[color]} />
      <Path
        d="M10 25.714c0-.947.995-1.714 2.222-1.714h15.556c1.227 0 2.222.767 2.222 1.714v2.572c0 .947-.995 1.714-2.222 1.714H12.222C10.995 30 10 29.233 10 28.286v-2.572Z"
        fill={theme.color[color]}
      />
    </Svg>
  );
};
export default IcoIdBack40;
