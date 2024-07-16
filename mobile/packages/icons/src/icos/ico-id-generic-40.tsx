import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoIdGeneric40 = ({ color = 'primary', style }: IconProps) => {
  const theme = useTheme();
  return (
    <Svg width={40} height={40} fill="none" style={style} aria-hidden={true}>
      <Rect x={5} y={5} width={30} height={30} rx={5} stroke={theme.color[color]} strokeWidth={3.5} />
      <Path
        d="M10 12.429c0-.79.995-1.429 2.222-1.429h15.556c1.227 0 2.222.64 2.222 1.429v2.142c0 .79-.995 1.429-2.222 1.429H12.222C10.995 16 10 15.36 10 14.571V12.43Z"
        fill={theme.color[color]}
      />
      <Rect x={17} y={19} width={12} height={2.4} rx={1.2} fill={theme.color[color]} />
    </Svg>
  );
};
export default IcoIdGeneric40;
