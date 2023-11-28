import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoVoter24 = ({ color = 'primary', style }: IconProps) => {
  const theme = useTheme();
  return (
    <Svg width={20} height={20} fill="none" style={style} aria-hidden={true}>
      <Path
        d="M2.188 16.563h15.624c.69 0 1.25-.56 1.25-1.25V4.687c0-.69-.56-1.25-1.25-1.25H2.188c-.69 0-1.25.56-1.25 1.25v10.625c0 .69.56 1.25 1.25 1.25Z"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M4.303 15.758c.543-1.903 1.738-4.062 3.127-4.062 1.388 0 2.584 2.159 3.126 4.062M7.43 11.071a2.188 2.188 0 1 0 0-4.375 2.188 2.188 0 0 0 0 4.375Z"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="m14.245 5.595.716.623.814-.489.148.938.938.148-.49.814.624.716-.898.309.017.95-.886-.341-.597.738-.46-.83-.932.18.181-.931-.83-.46.738-.597-.341-.887.95.017.308-.898Z"
        stroke={theme.color[color]}
        strokeLinejoin="round"
      />
    </Svg>
  );
};
export default IcoVoter24;
