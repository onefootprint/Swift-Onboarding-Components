import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoAndroid24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={24}
      height={24}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
      data-colored={false}
    >
      <path
        d="M9.21 4.013c-.042.008-.085.016-.12.04a.326.326 0 0 0-.08.45l.69 1.03c-1.067.565-1.862 1.504-2.12 2.63h8.838c-.26-1.126-1.054-2.065-2.12-2.63l.69-1.03a.326.326 0 0 0-.08-.45.328.328 0 0 0-.45.09l-.76 1.12a4.949 4.949 0 0 0-3.399 0l-.76-1.12a.321.321 0 0 0-.33-.13Zm1.029 2.55a.48.48 0 1 1 0 .96.48.48 0 0 1 0-.96Zm3.52 0a.48.48 0 1 1 0 .958.48.48 0 0 1 0-.958Zm-7.2 2.24a.96.96 0 0 0-.959.96v4.478c0 .53.43.96.96.96a.94.94 0 0 0 .32-.06V8.862a.938.938 0 0 0-.32-.06Zm.96 0v7.038c0 .528.432.96.96.96h7.039c.529 0 .96-.431.96-.96V8.802H7.52Zm9.918 0a.938.938 0 0 0-.32.06v6.278c.1.035.208.06.32.06.53 0 .96-.43.96-.96V9.762a.96.96 0 0 0-.96-.96ZM8.8 17.44v1.28a1.28 1.28 0 0 0 2.56 0v-1.28h-2.56Zm3.84 0v1.28a1.28 1.28 0 0 0 2.559 0v-1.28h-2.56Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoAndroid24;
