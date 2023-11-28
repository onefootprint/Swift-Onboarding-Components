import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoChevronLeftBig24 = ({ color = 'primary', style }: IconProps) => {
  const theme = useTheme();
  return (
    <Svg width={24} height={24} fill="none" style={style} aria-hidden={true}>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.983 6.138a.9.9 0 0 1-.047 1.271L9.993 12l4.943 4.59a.9.9 0 1 1-1.225 1.32l-5.653-5.25a.9.9 0 0 1 0-1.32l5.653-5.25a.9.9 0 0 1 1.272.048Z"
        fill={theme.color[color]}
      />
    </Svg>
  );
};
export default IcoChevronLeftBig24;
