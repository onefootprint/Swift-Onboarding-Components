import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoEye16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      <g clipPath="url(#prefix__a)">
        <path
          d="m1.333 8-.67-.335a.75.75 0 0 0 0 .67L1.333 8Zm13.334 0 .67.335a.75.75 0 0 0 0-.67l-.67.335Zm-12.663.335C3.518 5.304 5.82 3.917 8 3.917c2.18 0 4.482 1.387 5.996 4.418l1.342-.67C13.633 4.252 10.878 2.417 8 2.417c-2.877 0-5.633 1.835-7.337 5.248l1.341.67Zm-1.341 0c1.704 3.413 4.46 5.248 7.337 5.248s5.633-1.835 7.338-5.248l-1.342-.67C12.482 10.696 10.18 12.083 8 12.083c-2.18 0-4.482-1.387-5.996-4.418l-1.341.67ZM9.417 8c0 .782-.634 1.417-1.417 1.417v1.5A2.917 2.917 0 0 0 10.917 8h-1.5ZM8 9.417A1.417 1.417 0 0 1 6.583 8h-1.5A2.917 2.917 0 0 0 8 10.917v-1.5ZM6.583 8c0-.782.635-1.417 1.417-1.417v-1.5A2.917 2.917 0 0 0 5.083 8h1.5ZM8 6.583c.783 0 1.417.635 1.417 1.417h1.5A2.917 2.917 0 0 0 8 5.083v1.5Z"
          fill={theme.color[color]}
        />
      </g>
      <defs>
        <clipPath id="prefix__a">
          <path fill="#fff" d="M0 0h16v16H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};
export default IcoEye16;
