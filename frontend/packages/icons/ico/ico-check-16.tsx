import { Properties } from 'csstype';
import React from 'react';
import { Colors, useTheme } from 'styled';

export type IcoCheck16Props = {
  color?: Colors;
  style?: Properties;
  testID?: string;
};

const IcoCheck16 = ({ color = 'primary', style, testID }: IcoCheck16Props) => {
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
        d="m3 8.703 2.072 2.838a1.6 1.6 0 0 0 2.608-.034L13 3.81"
        stroke={theme.colors[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default IcoCheck16;
