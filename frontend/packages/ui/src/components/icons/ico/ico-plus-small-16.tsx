import { Properties } from 'csstype';
import React from 'react';

import type { Colors } from '../../../config/themes/types';
import { useTheme } from '../../styled';

export type IcoPlusSmall16Props = {
  color?: Colors;
  style?: Properties;
  testID?: string;
};

const IcoPlusSmall16 = ({
  color = 'primary',
  style,
  testID,
}: IcoPlusSmall16Props) => {
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
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.5 2.75a.75.75 0 0 0-1.5 0V7H2.75a.75.75 0 0 0 0 1.5H7v4.25a.75.75 0 0 0 1.5 0V8.5h4.25a.75.75 0 0 0 0-1.5H8.5V2.75Z"
        fill={theme.colors[color]}
      />
    </svg>
  );
};

export default IcoPlusSmall16;
