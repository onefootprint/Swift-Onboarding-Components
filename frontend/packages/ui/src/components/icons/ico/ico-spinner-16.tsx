import { Properties } from 'csstype';
import React from 'react';

import type { Colors } from '../../../config/themes/types';
import { useTheme } from '../../styled';

export type IcoSpinner16Props = {
  color?: Colors;
  style?: Properties;
  testID?: string;
};

const IcoSpinner16 = ({
  color = 'primary',
  style,
  testID,
}: IcoSpinner16Props) => {
  const theme = useTheme();
  return (
    <svg
      width={16}
      height={16}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      style={style}
    >
      <g clipPath="url(#prefix__a)">
        <path
          d="M8 0a8 8 0 0 1 8 8h-1.6A6.399 6.399 0 0 0 8 1.6V0Z"
          fill={theme.colors[color]}
        />
      </g>
      <defs>
        <clipPath id="prefix__a">
          <path fill="#fff" d="M0 0h16v16H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default IcoSpinner16;
