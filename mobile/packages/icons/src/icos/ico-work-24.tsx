import { useTheme } from '@onefootprint/styled';
import React from 'react';
import Svg, { Path } from 'react-native-svg';

import type { IconProps } from '../types';

const IcoWork24 = ({ color = 'primary', style }: IconProps) => {
  const theme = useTheme();
  return (
    <Svg width={24} height={24} fill="none" style={style} aria-hidden={true}>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.5 7.875v-1.5h-3v1.5h3ZM6 9.375v8.25h7.413c.03.535.166 1.042.387 1.5H6c-.832 0-1.5-.668-1.5-1.5l.008-8.25c0-.832.66-1.5 1.492-1.5h3v-1.5c0-.832.668-1.5 1.5-1.5h3c.832 0 1.5.668 1.5 1.5v1.5h3c.832 0 1.5.668 1.5 1.5v4.61a3.976 3.976 0 0 0-1.5-.547V9.375H6Zm13.824 7.112a.59.59 0 1 0-.835-.835l-2.231 2.231-.934-.933a.59.59 0 1 0-.835.835l1.351 1.351a.59.59 0 0 0 .835 0l2.65-2.65Z"
        fill={theme.color[color]}
      />
    </Svg>
  );
};
export default IcoWork24;
