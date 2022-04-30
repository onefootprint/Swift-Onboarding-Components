import { Properties } from 'csstype';
import React from 'react';
import { Colors, useTheme } from 'styled';

export type IcoClose24Props = {
  color?: Colors;
  style?: Properties;
  testID?: string;
};

const IcoClose24 = ({ color = 'primary', style, testID }: IcoClose24Props) => {
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
        d="M17.78 7.28a.75.75 0 0 0-1.06-1.06L12 10.94 7.28 6.22a.75.75 0 0 0-1.06 1.06L10.94 12l-4.72 4.72a.75.75 0 1 0 1.06 1.06L12 13.06l4.72 4.72a.75.75 0 1 0 1.06-1.06L13.06 12l4.72-4.72Z"
        fill={theme.colors[color]}
      />
    </svg>
  );
};

export default IcoClose24;
