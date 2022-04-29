import { Properties } from 'csstype';
import React from 'react';

import type { Colors } from '../../../config/themes/types';
import { useTheme } from '../../styled';

export type IcoChevronRight24Props = {
  color?: Colors;
  style?: Properties;
  testID?: string;
};

const IcoChevronRight24 = ({
  color = 'primary',
  style,
  testID,
}: IcoChevronRight24Props) => {
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
        d="m10.75 8.75 3.5 3.25-3.5 3.25"
        stroke={theme.colors[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default IcoChevronRight24;
