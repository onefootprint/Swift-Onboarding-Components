import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoCheckSmall16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M11.351 4.563a.65.65 0 0 0-.2.094c-.054.039-1.106 1.238-2.338 2.665l-2.24 2.596-.853-.864c-.469-.475-.895-.885-.947-.91-.134-.068-.409-.063-.546.009a.684.684 0 0 0-.295.3.708.708 0 0 0 .001.52c.067.141 2.252 2.343 2.4 2.421a.65.65 0 0 0 .534 0c.058-.031.15-.102.204-.158a584.48 584.48 0 0 0 2.541-2.929c2.221-2.569 2.447-2.84 2.485-2.968a.623.623 0 0 0-.746-.776"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoCheckSmall16;
