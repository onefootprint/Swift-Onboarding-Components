import { useTheme } from 'styled-components';
import React from 'react';
import Svg, { Path } from 'react-native-svg';

import type { IconProps } from '../types';

const IcoCheckSmall16 = ({ color = 'primary', style }: IconProps) => {
  const theme = useTheme();
  return (
    <Svg width={16} height={16} fill="none" style={style} aria-hidden={true}>
      <Path
        d="M12.601 4a.615.615 0 0 0-.423.186l-6.329 6.33L3.824 8.49a.615.615 0 1 0-.87.87l2.46 2.459a.615.615 0 0 0 .87 0l6.764-6.764A.616.616 0 0 0 12.601 4Z"
        fill={theme.color[color]}
      />
    </Svg>
  );
};
export default IcoCheckSmall16;
