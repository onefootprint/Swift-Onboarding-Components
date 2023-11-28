import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoSmartphone24 = ({ color = 'primary', style }: IconProps) => {
  const theme = useTheme();
  return (
    <Svg width={24} height={24} fill="none" style={style} aria-hidden={true}>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.75 4A2.75 2.75 0 0 0 6 6.75v10.5A2.75 2.75 0 0 0 8.75 20h6.5A2.75 2.75 0 0 0 18 17.25V6.75A2.75 2.75 0 0 0 15.25 4h-6.5ZM7.5 6.75c0-.69.56-1.25 1.25-1.25h6.5c.69 0 1.25.56 1.25 1.25v10.5c0 .69-.56 1.25-1.25 1.25h-6.5c-.69 0-1.25-.56-1.25-1.25V6.75ZM11.75 16a.75.75 0 0 0 0 1.5h.5a.75.75 0 0 0 0-1.5h-.5Z"
        fill={theme.color[color]}
      />
    </Svg>
  );
};
export default IcoSmartphone24;
