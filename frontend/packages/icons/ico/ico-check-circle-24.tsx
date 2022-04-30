import { Properties } from 'csstype';
import React from 'react';
import { Colors, useTheme } from 'styled';

export type IcoCheckCircle24Props = {
  color?: Colors;
  style?: Properties;
  testID?: string;
};

const IcoCheckCircle24 = ({
  color = 'primary',
  style,
  testID,
}: IcoCheckCircle24Props) => {
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
        d="M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm-6.5 8a6.5 6.5 0 1 1 13 0 6.5 6.5 0 0 1-13 0Zm9.4-1.877a.75.75 0 1 0-1.3-.746l-2.294 3.997a.25.25 0 0 1-.443-.018l-.434-.925a.75.75 0 0 0-1.358.638l.434.924c.601 1.282 2.397 1.356 3.102.128l2.293-3.998Z"
        fill={theme.colors[color]}
      />
    </svg>
  );
};

export default IcoCheckCircle24;
