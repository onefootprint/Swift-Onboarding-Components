import { useTheme } from '@onefootprint/styled';
import React from 'react';
import Svg, { Path } from 'react-native-svg';

import type { IconProps } from '../types';

const IcoRepeat40 = ({ color = 'primary', style }: IconProps) => {
  const theme = useTheme();
  return (
    <Svg width={40} height={40} fill="none" style={style} aria-hidden={true}>
      <Path
        d="m25 9.375 3.75 3.75-3.75 3.75m2.5-3.75H11.25A6.269 6.269 0 0 0 5 19.375v1.25m10 10-3.75-3.75 3.75-3.75m-2.5 3.75h16.25a6.269 6.269 0 0 0 6.25-6.25v-1.25"
        stroke={theme.color[color]}
        strokeWidth={3.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
export default IcoRepeat40;
