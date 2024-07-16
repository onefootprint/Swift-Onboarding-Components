import React from 'react';
import Svg, { Ellipse, Path, Rect } from 'react-native-svg';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoIdFront40 = ({ color = 'primary', style }: IconProps) => {
  const theme = useTheme();
  return (
    <Svg width={40} height={40} fill="none" style={style} aria-hidden={true}>
      <Ellipse cx={13.454} cy={13.455} rx={1.455} ry={1.454} fill={theme.color[color]} />
      <Ellipse cx={18.545} cy={13.455} rx={1.455} ry={1.454} fill={theme.color[color]} />
      <Path
        d="M12 18.789s1 1.94 4 1.94 4-1.94 4-1.94"
        stroke={theme.color[color]}
        strokeWidth={2.4}
        strokeLinecap="round"
      />
      <Rect x={24.286} y={24.286} width={5.714} height={1.905} rx={0.952} fill={theme.color[color]} />
      <Rect x={20.477} y={28.095} width={9.524} height={1.905} rx={0.952} fill={theme.color[color]} />
      <Rect x={5} y={5} width={30} height={30} rx={5} stroke={theme.color[color]} strokeWidth={3.5} />
    </Svg>
  );
};
export default IcoIdFront40;
