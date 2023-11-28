import { useTheme } from 'styled-components';
import React from 'react';
import Svg, { Path } from 'react-native-svg';

import type { IconProps } from '../types';

const IcoWarning24 = ({ color = 'primary', style }: IconProps) => {
  const theme = useTheme();
  return (
    <Svg width={24} height={24} fill="none" style={style} aria-hidden={true}>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.124 6.19c-.46-.92-1.774-.92-2.235 0L5.626 16.687a1.25 1.25 0 0 0 1.118 1.81h10.52a1.25 1.25 0 0 0 1.118-1.81L13.124 6.19Zm-3.576-.673c1.015-2.023 3.903-2.023 4.917.001l5.259 10.497c.916 1.829-.414 3.982-2.46 3.982H6.745c-2.046 0-3.376-2.154-2.459-3.982L9.548 5.517Zm2.456 3.48a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1Zm0 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z"
        fill={theme.color[color]}
      />
    </Svg>
  );
};
export default IcoWarning24;
