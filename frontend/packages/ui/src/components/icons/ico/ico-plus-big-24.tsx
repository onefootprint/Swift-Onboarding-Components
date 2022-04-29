import { Properties } from 'csstype';
import React from 'react';

import type { Colors } from '../../../config/themes/types';
import { useTheme } from '../../styled';

export type IcoPlusBig24Props = {
  color?: Colors;
  style?: Properties;
  testID?: string;
};

const IcoPlusBig24 = ({
  color = 'primary',
  style,
  testID,
}: IcoPlusBig24Props) => {
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
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.95 5.75a.75.75 0 0 0-1.5 0v5.5h-5.5a.75.75 0 0 0 0 1.5h5.5v5.5a.75.75 0 1 0 1.5 0v-5.5h5.5a.75.75 0 0 0 0-1.5h-5.5v-5.5Z"
        fill={theme.colors[color]}
      />
    </svg>
  );
};

export default IcoPlusBig24;
