import { useTheme } from '@onefootprint/styled';
import React from 'react';
import Svg, { Path } from 'react-native-svg';

import type { IconProps } from '../types';

const IcoCar24 = ({ color = 'primary', style }: IconProps) => {
  const theme = useTheme();
  return (
    <Svg width={24} height={24} fill="none" style={style} aria-hidden={true}>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.211 6.545A1.25 1.25 0 0 1 8.444 5.5h7.112a1.25 1.25 0 0 1 1.233 1.045L17.365 10H6.635l.576-3.455Zm-2.2 4.074.72-4.321A2.75 2.75 0 0 1 8.445 4h7.112a2.75 2.75 0 0 1 2.713 2.298l.72 4.321A2.745 2.745 0 0 1 20 12.75v3.5A1.75 1.75 0 0 1 18.25 18H18v1.25a.75.75 0 0 1-1.5 0V18h-9v1.25a.75.75 0 0 1-1.5 0V18h-.25A1.75 1.75 0 0 1 4 16.25v-3.5c0-.86.394-1.627 1.011-2.13Zm1.739.881c-.69 0-1.25.56-1.25 1.25v3.5c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25v-3.5c0-.69-.56-1.25-1.25-1.25H6.75ZM8 13a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm7 1a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z"
        fill={theme.color[color]}
      />
    </Svg>
  );
};
export default IcoCar24;
