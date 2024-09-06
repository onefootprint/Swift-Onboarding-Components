import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoChevronDown24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M7.775 9.428c-.128.025-.418.289-.48.438a.75.75 0 0 0 .021.594c.051.108.691.773 1.969 2.045 1.794 1.785 1.908 1.889 2.135 1.974a1.58 1.58 0 0 0 1.28-.049c.227-.112 3.884-3.756 3.984-3.97a.75.75 0 0 0 .021-.594c-.083-.199-.362-.418-.574-.449-.39-.059-.351-.09-2.321 1.876L12 13.099l-1.79-1.788c-1.228-1.227-1.837-1.807-1.939-1.85a.86.86 0 0 0-.496-.033"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoChevronDown24;
