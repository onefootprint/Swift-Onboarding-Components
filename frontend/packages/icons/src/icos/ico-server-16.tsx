import { useTheme } from '@onefootprint/styled';
import React from 'react';

import type { IconProps } from '../types';

const IcoServer16 = ({ color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={17}
      height={17}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.38 3.286c0-.052.041-.094.093-.094h7.63v2.964h-7.63a.093.093 0 0 1-.093-.094V3.286Zm9.123 2.87V3.192h.887c.051 0 .093.042.093.094v2.776a.093.093 0 0 1-.093.094h-.887Zm-9.03-4.364c-.825 0-1.493.669-1.493 1.494v2.776c0 .825.668 1.494 1.493 1.494h9.917c.825 0 1.493-.669 1.493-1.494V3.286c0-.825-.668-1.494-1.493-1.494H3.473Zm-.093 8.634c0-.052.041-.094.093-.094h7.63v2.964h-7.63a.093.093 0 0 1-.093-.093v-2.777Zm9.123 2.87h.887a.093.093 0 0 0 .093-.093v-2.777a.093.093 0 0 0-.093-.094h-.887v2.964Zm-9.03-4.364c-.825 0-1.493.669-1.493 1.494v2.777c0 .824.668 1.493 1.493 1.493h9.917c.825 0 1.493-.669 1.493-1.493v-2.777c0-.825-.668-1.494-1.493-1.494H3.473Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoServer16;
