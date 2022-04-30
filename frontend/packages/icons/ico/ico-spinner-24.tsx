import { Properties } from 'csstype';
import React from 'react';
import { Colors, useTheme } from 'styled';

export type IcoSpinner24Props = {
  color?: Colors;
  style?: Properties;
  testID?: string;
};

const IcoSpinner24 = ({
  color = 'primary',
  style,
  testID,
}: IcoSpinner24Props) => {
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
        d="M12 2a10 10 0 0 1 10 10h-2a7.999 7.999 0 0 0-8-8V2Z"
        fill={theme.colors[color]}
      />
    </svg>
  );
};

export default IcoSpinner24;
