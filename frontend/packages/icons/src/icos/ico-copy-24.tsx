import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoCopy24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={24}
      height={24}
      fill={theme.color[color]}
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
      data-colored={false}
    >
      <path
        d="M4.22 3.654a1.31 1.31 0 0 0-.604.648c-.073.191-.076.376-.076 5.198 0 4.832.003 5.007.077 5.199.1.261.375.549.634.667l.209.094 2.028.012 2.027.013.013 2.027.012 2.028.094.209c.118.259.406.534.667.634.192.074.367.077 5.219.077h5.02l.209-.094a1.36 1.36 0 0 0 .634-.667c.074-.192.077-.367.077-5.199 0-4.822-.003-5.007-.076-5.198a1.392 1.392 0 0 0-.562-.635c-.159-.086-.196-.087-2.25-.098l-2.087-.012-.013-2.048c-.012-2.041-.012-2.05-.104-2.249a1.363 1.363 0 0 0-.548-.593l-.16-.087-5.12-.01-5.12-.01-.2.094M13.96 6.8v1.76h-2.27l-2.27.001-.2.095a1.268 1.268 0 0 0-.588.604l-.092.2-.012 2.25-.012 2.25H5.04V5.04h8.92V6.8m5 7.7v4.46h-8.92v-8.92h8.92v4.46"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoCopy24;
