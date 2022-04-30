import { Properties } from 'csstype';
import React from 'react';
import { Colors, useTheme } from 'styled';

export type IcoEmail16Props = {
  color?: Colors;
  style?: Properties;
  testID?: string;
};

const IcoEmail16 = ({ color = 'primary', style, testID }: IcoEmail16Props) => {
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
        d="M3.655 2.13A2.355 2.355 0 0 0 1.3 4.485v7.035c0 1.3 1.054 2.355 2.355 2.355h8.69c1.3 0 2.355-1.055 2.355-2.355V4.485c0-1.3-1.054-2.355-2.355-2.355h-8.69ZM2.7 4.456v7.064c0 .527.428.955.955.955h8.69a.955.955 0 0 0 .955-.955V4.455L8.464 8.735a.7.7 0 0 1-.928 0L2.7 4.456Zm9.533-.926H3.767L8 7.275l4.233-3.745Z"
        fill={theme.colors[color]}
      />
    </svg>
  );
};

export default IcoEmail16;
