import { Properties } from 'csstype';
import React from 'react';
import { Colors, useTheme } from 'styled';

export type IcoArrowUpRight16Props = {
  color?: Colors;
  style?: Properties;
  testID?: string;
};

const IcoArrowUpRight16 = ({
  color = 'primary',
  style,
  testID,
}: IcoArrowUpRight16Props) => {
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
        d="M5.623 2.05a.7.7 0 1 0 0 1.4h4.53L3.665 9.938a.7.7 0 1 0 .99.99l6.488-6.488v4.53a.7.7 0 1 0 1.4 0V2.75a.7.7 0 0 0-.7-.7h-6.22Z"
        fill={theme.colors[color]}
      />
    </svg>
  );
};

export default IcoArrowUpRight16;
