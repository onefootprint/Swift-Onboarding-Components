import React from 'react';
import { useTheme } from 'styled';

import type { IconProps } from '../src/types';

const IcoLock16 = ({ color = 'primary', style, testID }: IconProps) => {
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
        d="M5.987 3.87c.343-.352.938-.7 2.01-.7 1.073 0 1.668.348 2.011.7.288.294.442.69.516 1.2.064.437.064.9.062 1.4H5.409c-.002-.5-.002-.963.062-1.4.074-.51.228-.906.516-1.2Zm-1.778 2.6c-.002-.493-.003-1.05.074-1.574.095-.646.315-1.321.845-1.865.59-.604 1.504-1.061 2.87-1.061 1.365 0 2.28.457 2.87 1.061.53.544.749 1.219.844 1.865.077.525.076 1.081.074 1.574h.149c.746 0 1.35.604 1.35 1.35v4.125a2.1 2.1 0 0 1-2.1 2.1H4.81a2.1 2.1 0 0 1-2.1-2.1V7.82c0-.746.604-1.35 1.35-1.35h.149ZM3.91 7.82a.15.15 0 0 1 .15-.15h7.875a.15.15 0 0 1 .15.15v4.125a.9.9 0 0 1-.9.9H4.81a.9.9 0 0 1-.9-.9V7.82Z"
        fill={theme.colors[color]}
      />
    </svg>
  );
};

export default IcoLock16;
