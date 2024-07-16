import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoSelfie40 = ({ color = 'primary', style }: IconProps) => {
  const theme = useTheme();
  return (
    <Svg width={40} height={41} fill="none" style={style} aria-hidden={true}>
      <Circle cx={16.5} cy={17} r={2} fill={theme.color[color]} />
      <Circle cx={23.5} cy={17} r={2} fill={theme.color[color]} />
      <Path
        d="M14.5 24.333S15.875 27 20 27s5.5-2.667 5.5-2.667"
        stroke={theme.color[color]}
        strokeWidth={2.4}
        strokeLinecap="round"
      />
      <Rect x={8} y={6} width={24} height={30} rx={5} stroke={theme.color[color]} strokeWidth={3.5} />
      <Path
        d="M33.879 8.99a.696.696 0 0 0-.08.635l2.282 6.168c.247.669-.55 1.232-1.098.776l-5.074-4.227a.696.696 0 0 0-.582-.148l-4.827.967a.696.696 0 0 1-.69-1.103l2.77-3.646a.696.696 0 0 0 .098-.662L24.404 1.6c-.247-.668.55-1.232 1.098-.776l5.054 4.211a.696.696 0 0 0 .623.138l4.687-1.232c.624-.165 1.116.535.75 1.067l-2.737 3.98Z"
        fill="#fff"
      />
      <Path
        d="M31.972 8.882a.221.221 0 0 0-.038.218l1.258 3.4c.079.213-.175.393-.349.248l-2.787-2.322a.221.221 0 0 0-.216-.038l-3.3 1.186c-.211.076-.388-.174-.246-.348l2.22-2.714a.222.222 0 0 0 .036-.217L27.29 4.893c-.078-.212.176-.392.35-.247l2.786 2.32c.06.052.144.066.218.038l3.4-1.257c.213-.08.393.175.248.349l-2.321 2.786Z"
        fill={theme.color[color]}
      />
    </Svg>
  );
};
export default IcoSelfie40;
