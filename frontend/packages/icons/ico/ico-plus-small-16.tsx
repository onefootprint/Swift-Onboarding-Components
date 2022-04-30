import { Properties } from 'csstype';
import React from 'react';
import { Colors, useTheme } from 'styled';

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
        d="M8.45 2.75a.7.7 0 1 0-1.4 0v4.3h-4.3a.7.7 0 1 0 0 1.4h4.3v4.3a.7.7 0 1 0 1.4 0v-4.3h4.3a.7.7 0 1 0 0-1.4h-4.3v-4.3Z"
        fill={theme.colors[color]}
      />
    </svg>
  );
};

export default IcoPlusSmall16;
