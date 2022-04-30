import { Properties } from 'csstype';
import React from 'react';
import { Colors, useTheme } from 'styled';

export type IcoPlusBig16Props = {
  color?: Colors;
  style?: Properties;
  testID?: string;
};

const IcoPlusBig16 = ({
  color = 'primary',
  style,
  testID,
}: IcoPlusBig16Props) => {
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
        d="M8.75 1.75a.75.75 0 0 0-1.5 0v5.5h-5.5a.75.75 0 0 0 0 1.5h5.5v5.5a.75.75 0 0 0 1.5 0v-5.5h5.5a.75.75 0 0 0 0-1.5h-5.5v-5.5Z"
        fill={theme.colors[color]}
      />
    </svg>
  );
};

export default IcoPlusBig16;
