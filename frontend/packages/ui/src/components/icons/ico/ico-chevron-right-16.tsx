import { Properties } from 'csstype';
import React from 'react';

import type { Colors } from '../../../config/themes/types';
import { useTheme } from '../../styled';

export type IcoChevronRight16Props = {
  color?: Colors;
  style?: Properties;
  testID?: string;
};

const IcoChevronRight16 = ({
  color = 'primary',
  style,
  testID,
}: IcoChevronRight16Props) => {
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
      <path
        d="M6.25 4.75 9.75 8l-3.5 3.25"
        stroke={theme.colors[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default IcoChevronRight16;
