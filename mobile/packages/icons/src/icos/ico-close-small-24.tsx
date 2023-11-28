import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoCloseSmall24 = ({ color = 'primary', style }: IconProps) => {
  const theme = useTheme();
  return (
    <Svg width={24} height={24} fill="none" style={style} aria-hidden={true}>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.903 8.366a.9.9 0 1 0-1.273-1.272l-3.632 3.631-3.632-3.631a.9.9 0 0 0-1.272 1.272l3.631 3.632-3.631 3.632a.9.9 0 0 0 1.272 1.273l3.632-3.632 3.632 3.632a.9.9 0 1 0 1.273-1.273l-3.632-3.632 3.632-3.632Z"
        fill={theme.color[color]}
      />
    </Svg>
  );
};
export default IcoCloseSmall24;
