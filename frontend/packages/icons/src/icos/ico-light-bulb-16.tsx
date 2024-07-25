import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoLightBulb16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M7.996 1.05c-3.49 0-5.226 2.775-5.226 5.226 0 1.944.745 3.076 1.478 3.87.168.181.334.345.479.487l.02.02c.155.152.278.274.379.39.206.234.23.34.23.407v1.94c0 .863.7 1.562 1.562 1.562h2.156c.862 0 1.562-.699 1.562-1.562v-1.94c0-.067.025-.173.23-.407.102-.116.225-.238.38-.39l.02-.02c.144-.142.31-.306.478-.487.733-.794 1.479-1.926 1.479-3.87 0-2.451-1.738-5.226-5.227-5.226ZM4.17 6.276c0-1.86 1.28-3.826 3.826-3.826 2.546 0 3.827 1.967 3.827 3.826 0 1.506-.548 2.314-1.108 2.92-.144.156-.288.299-.437.445l-.014.014a8.96 8.96 0 0 0-.45.464c-.27.308-.56.724-.577 1.277H6.755c-.017-.553-.306-.969-.577-1.277a8.977 8.977 0 0 0-.45-.464l-.013-.014c-.15-.146-.294-.289-.438-.444-.56-.607-1.107-1.415-1.107-2.92Zm2.586 6.52v.594c0 .09.072.162.162.162h2.156c.09 0 .162-.073.162-.162v-.594h-2.48Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoLightBulb16;
