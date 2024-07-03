import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoServer16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={16}
      height={16}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
      data-colored={false}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.95 3.043c0-.051.042-.093.093-.093h7.63v2.963h-7.63a.093.093 0 0 1-.093-.093V3.043Zm9.124 2.87V2.95h.886c.052 0 .094.042.094.093V5.82a.093.093 0 0 1-.094.093h-.886ZM3.044 1.55c-.825 0-1.494.669-1.494 1.493V5.82c0 .825.669 1.493 1.493 1.493h9.917c.825 0 1.494-.668 1.494-1.493V3.043c0-.824-.669-1.493-1.494-1.493H3.043Zm-.094 8.634c0-.052.042-.094.093-.094h7.63v2.964h-7.63a.093.093 0 0 1-.093-.094v-2.776Zm9.124 2.87h.886a.093.093 0 0 0 .094-.094v-2.776a.093.093 0 0 0-.094-.094h-.886v2.964ZM3.044 8.69c-.825 0-1.494.669-1.494 1.494v2.776c0 .825.669 1.494 1.493 1.494h9.917c.825 0 1.494-.669 1.494-1.494v-2.776c0-.825-.669-1.494-1.494-1.494H3.043Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoServer16;
