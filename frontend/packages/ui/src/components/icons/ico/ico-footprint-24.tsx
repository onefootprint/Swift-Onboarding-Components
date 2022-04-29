import { Properties } from 'csstype';
import React from 'react';

import type { Colors } from '../../../config/themes/types';
import { useTheme } from '../../styled';

export type IcoFootprint24Props = {
  color?: Colors;
  style?: Properties;
  testID?: string;
};

const IcoFootprint24 = ({
  color = 'primary',
  style,
  testID,
}: IcoFootprint24Props) => {
  const theme = useTheme();
  return (
    <svg
      width={24}
      height={24}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      style={style}
    >
      <path
        d="M14.66 14h2.666v-2.36a2.666 2.666 0 1 1 0-4.614V4H6.66v16h4.666v-2.666A3.333 3.333 0 0 1 14.66 14Z"
        fill={theme.colors[color]}
      />
    </svg>
  );
};

export default IcoFootprint24;
