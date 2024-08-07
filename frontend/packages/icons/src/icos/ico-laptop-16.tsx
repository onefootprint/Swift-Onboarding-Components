import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoLaptop16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M2.964 1.895c-.36.047-.756.329-.936.666-.166.313-.16.155-.161 4.242v3.724l-.42.012c-.456.013-.567.04-.709.176a.855.855 0 0 0-.134.178c-.055.103-.058.142-.066 1.07-.008 1.052.004 1.178.145 1.456.096.19.353.451.544.553.32.17-.091.16 6.773.16s6.453.01 6.773-.16a1.58 1.58 0 0 0 .546-.556c.13-.257.147-.414.147-1.391.001-.997-.012-1.093-.167-1.27-.149-.169-.267-.204-.746-.217l-.42-.011V6.803c-.001-4.087.005-3.929-.161-4.242a1.51 1.51 0 0 0-.592-.562 1.384 1.384 0 0 0-.368-.105c-.244-.032-9.803-.03-10.048.001m9.909 4.938.007 3.7H3.12V6.844c0-2.028.008-3.696.018-3.706.01-.01 2.203-.015 4.873-.011l4.856.006.006 3.7m1.334 5.494-.007.54H1.8l-.007-.54-.007-.54h12.428l-.007.54"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoLaptop16;
