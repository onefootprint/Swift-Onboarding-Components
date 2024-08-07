import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoMinimize16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M9.049 1.896a.613.613 0 0 0-.453.344c-.047.089-.049.201-.049 2.427 0 2.225.002 2.337.049 2.426.07.131.173.235.297.303.107.057.109.057 2.371.065 2.507.008 2.45.011 2.647-.162a.62.62 0 0 0 .045-.884c-.202-.208-.134-.2-1.795-.201l-1.48-.001 1.684-1.686c1.668-1.671 1.684-1.688 1.728-1.841a.612.612 0 0 0-.345-.754.762.762 0 0 0-.512.003c-.068.031-.66.603-1.776 1.715L9.787 5.319l-.001-1.48c0-1.375-.004-1.487-.049-1.586a.621.621 0 0 0-.688-.357M2.382 8.561a.604.604 0 0 0-.442.332.628.628 0 0 0 .311.843c.102.046.206.05 1.588.05l1.48.001-1.684 1.686c-1.668 1.671-1.684 1.688-1.728 1.841a.619.619 0 0 0 .779.779c.153-.044.17-.06 1.841-1.728l1.686-1.684.001 1.48c0 1.382.004 1.486.05 1.588.24.529.997.481 1.162-.073.061-.209.061-4.476 0-4.685a.63.63 0 0 0-.333-.389c-.118-.055-.15-.055-2.36-.06-1.232-.002-2.29.006-2.351.019"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoMinimize16;
