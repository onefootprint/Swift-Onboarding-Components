import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoEnter16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M13.364 2.563a.656.656 0 0 0-.425.33c-.042.075-.047.314-.059 3.36l-.013 3.28-4.426.007-4.425.007.841-.847c.942-.948.95-.958.922-1.264a.6.6 0 0 0-.553-.549c-.315-.029-.256-.077-1.844 1.51C1.967 9.81 1.95 9.828 1.906 9.981a.607.607 0 0 0 .042.472c.06.116 2.835 2.887 2.945 2.941.397.196.891-.103.893-.541.001-.276.006-.268-.914-1.193l-.857-.86h4.453c3.721-.001 4.481-.007 4.629-.038.507-.108.923-.54 1.008-1.047.022-.13.028-1.102.023-3.448L14.12 3l-.058-.109a.64.64 0 0 0-.698-.328"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoEnter16;
