import { Properties } from 'csstype';
import React from 'react';
import { Colors, useTheme } from 'styled';

export type IcoPlusSmall24Props = {
  color?: Colors;
  style?: Properties;
  testID?: string;
};

const IcoPlusSmall24 = ({
  color = 'primary',
  style,
  testID,
}: IcoPlusSmall24Props) => {
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
        d="M12.75 7a.75.75 0 0 0-1.5 0v4.25H7a.75.75 0 0 0 0 1.5h4.25V17a.75.75 0 0 0 1.5 0v-4.25H17a.75.75 0 0 0 0-1.5h-4.25V7Z"
        fill={theme.colors[color]}
      />
    </svg>
  );
};

export default IcoPlusSmall24;
