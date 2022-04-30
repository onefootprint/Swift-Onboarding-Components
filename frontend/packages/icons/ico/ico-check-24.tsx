import { Properties } from 'csstype';
import React from 'react';
import { Colors, useTheme } from 'styled';

export type IcoCheck24Props = {
  color?: Colors;
  style?: Properties;
  testID?: string;
};

const IcoCheck24 = ({ color = 'primary', style, testID }: IcoCheck24Props) => {
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
        d="m5.75 12.877 2.59 3.547a2 2 0 0 0 3.26-.042l6.65-9.622"
        stroke={theme.colors[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default IcoCheck24;
