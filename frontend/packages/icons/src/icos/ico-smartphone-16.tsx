import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoSmartphone16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={16}
      height={16}
      fill={theme.color[color]}
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
      data-colored={false}
    >
      <path
        d="M4.297.562c-.359.047-.756.329-.935.665-.171.32-.161-.091-.161 6.773s-.01 6.453.161 6.773c.102.192.363.448.555.546.298.151.188.147 4.083.147s3.785.004 4.083-.147c.192-.098.453-.354.555-.546.171-.32.161.091.161-6.773s.01-6.453-.161-6.773a1.504 1.504 0 0 0-.591-.561 1.384 1.384 0 0 0-.368-.105C11.435.529 4.542.53 4.297.562M11.533 8v6.2H4.467L4.46 8.027c-.004-3.396-.001-6.189.006-6.207.01-.027.732-.032 3.54-.027l3.527.007V8m-5.282 4.264c-.529.24-.481.997.073 1.162.207.061 3.145.061 3.352 0 .554-.165.602-.922.073-1.162-.102-.046-.209-.049-1.749-.049s-1.647.003-1.749.049"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoSmartphone16;
