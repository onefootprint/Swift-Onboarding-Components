import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoCheckCircle40 = ({ color = 'primary', style }: IconProps) => {
  const theme = useTheme();
  return (
    <Svg width={40} height={40} fill="none" style={style} aria-hidden={true}>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M19.997 6.06C12.3 6.06 6.06 12.3 6.06 19.998c0 7.697 6.24 13.937 13.938 13.937 7.697 0 13.937-6.24 13.937-13.937 0-7.698-6.24-13.938-13.938-13.938ZM8.56 19.998c0-6.317 5.12-11.438 11.437-11.438 6.317 0 11.438 5.12 11.438 11.438 0 6.316-5.12 11.437-11.438 11.437-6.316 0-11.437-5.12-11.437-11.437Zm16.46-3.316a1.25 1.25 0 1 0-2.17-1.244l-4.013 6.995a.5.5 0 0 1-.886-.036l-.76-1.618a1.25 1.25 0 1 0-2.263 1.062l.76 1.618c1.03 2.197 4.11 2.324 5.317.218l4.014-6.995Z"
        fill={theme.color[color]}
      />
    </Svg>
  );
};
export default IcoCheckCircle40;
