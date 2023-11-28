import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoSun24 = ({ color = 'primary', style }: IconProps) => {
  const theme = useTheme();
  return (
    <Svg width={24} height={24} fill="none" style={style} aria-hidden={true}>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 3a.75.75 0 0 1 .75.75v1.337a.75.75 0 0 1-1.5 0V3.75A.75.75 0 0 1 12 3Zm0 6.851a2.148 2.148 0 1 0 0 4.297 2.148 2.148 0 0 0 0-4.297ZM8.35 11.999a3.648 3.648 0 1 1 7.297 0 3.648 3.648 0 0 1-7.297 0Zm8.86-4.151a.75.75 0 0 0-1.06-1.061l-1.056 1.055a.75.75 0 0 0 1.06 1.061l1.056-1.055Zm.95 4.152a.75.75 0 0 1 .75-.75h1.337a.75.75 0 1 1 0 1.5H18.91a.75.75 0 0 1-.75-.75Zm-2.005 3.095a.75.75 0 0 0-1.06 1.061l1.055 1.055a.75.75 0 1 0 1.06-1.06l-1.055-1.056ZM12 18.161a.75.75 0 0 1 .75.75v1.337a.75.75 0 0 1-1.5 0V18.91a.75.75 0 0 1 .75-.75Zm-3.097-2.005a.75.75 0 0 0-1.06-1.06L6.786 16.15a.75.75 0 1 0 1.06 1.06l1.056-1.055ZM3 12a.75.75 0 0 1 .75-.75h1.337a.75.75 0 1 1 0 1.5H3.75A.75.75 0 0 1 3 12Zm4.848-5.213a.75.75 0 0 0-1.061 1.06l1.055 1.056a.75.75 0 1 0 1.06-1.06L7.849 6.786Z"
        fill={theme.color[color]}
      />
    </Svg>
  );
};
export default IcoSun24;
