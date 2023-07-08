import { useTheme } from '@onefootprint/styled';
import React from 'react';
import Svg, { Path } from 'react-native-svg';

import type { IconProps } from '../types';

const IcoSparkles24 = ({ color = 'primary', style }: IconProps) => {
  const theme = useTheme();
  return (
    <Svg width={24} height={24} fill="none" style={style} aria-hidden={true}>
      <Path
        d="M15 4.75C15 7.511 13.511 10 10.75 10c2.761 0 4.25 2.489 4.25 5.25 0-2.761 1.489-5.25 4.25-5.25C16.489 10 15 7.511 15 4.75ZM8 12.75C8 14.407 6.407 16 4.75 16 6.407 16 8 17.593 8 19.25 8 17.593 9.593 16 11.25 16 9.593 16 8 14.407 8 12.75Z"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
export default IcoSparkles24;
