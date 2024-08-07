import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoHome24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M11.552 3.023a2.117 2.117 0 0 0-.44.228c-.331.222-6.13 4.974-6.315 5.174A1.336 1.336 0 0 0 4.456 9c-.073.211-.076.4-.076 4.76 0 4.361.003 4.549.076 4.76.182.526.531.868 1.049 1.028.223.068.564.072 6.495.072s6.272-.004 6.495-.072a1.529 1.529 0 0 0 1.053-1.053c.068-.221.072-.504.072-4.755 0-4.34-.003-4.529-.076-4.74a1.336 1.336 0 0 0-.341-.575c-.185-.2-5.984-4.951-6.314-5.174a2.129 2.129 0 0 0-.458-.23 1.734 1.734 0 0 0-.879.002m3.508 3.908L18.1 9.42v8.68H5.9V9.42l3.04-2.489c1.672-1.37 3.049-2.49 3.06-2.49.011 0 1.388 1.12 3.06 2.49"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoHome24;
