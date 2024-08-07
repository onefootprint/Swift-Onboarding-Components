import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoWork16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M5.631 1.229c-.36.046-.756.328-.936.665-.139.26-.161.431-.161 1.246l-.001.727H3.527c-1.133.001-1.329.018-1.574.132a1.5 1.5 0 0 0-.591.562c-.168.314-.161.136-.161 4.439 0 4.257-.005 4.116.147 4.416.098.193.354.453.546.556.319.169-.026.16 6.106.16s5.787.009 6.106-.16a1.58 1.58 0 0 0 .546-.556c.152-.3.147-.159.147-4.416 0-4.303.007-4.125-.161-4.439a1.5 1.5 0 0 0-.591-.562c-.245-.114-.441-.131-1.574-.132h-1.006l-.001-.727c0-.815-.022-.986-.161-1.246a1.497 1.497 0 0 0-.591-.561 1.392 1.392 0 0 0-.369-.106c-.241-.031-4.472-.03-4.714.002m4.576 1.938.007.7H5.787v-.689c0-.379.008-.697.018-.707.009-.01 1.002-.015 2.206-.011l2.189.007.007.7M13.533 9v3.867H2.467l-.007-3.84a293.6 293.6 0 0 1 .006-3.874c.01-.026 1.132-.032 5.54-.026l5.527.006V9"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoWork16;
