import { Properties } from 'csstype';
import React from 'react';
import { Colors, useTheme } from 'styled';

export type IcoChevronLeft24Props = {
  color?: Colors;
  style?: Properties;
  testID?: string;
};

const IcoChevronLeft24 = ({
  color = 'primary',
  style,
  testID,
}: IcoChevronLeft24Props) => {
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
        d="M13.25 8.75 9.75 12l3.5 3.25"
        stroke={theme.colors[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default IcoChevronLeft24;
