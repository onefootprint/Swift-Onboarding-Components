import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoEmail40 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={40}
      height={40}
      fill={theme.color[color]}
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
      data-colored={false}
    >
      <path d="M6.143 6.735c-1.358.2-2.421 1.206-2.709 2.566-.148.7-.148 20.698 0 21.398.144.679.396 1.14.894 1.639.499.499.96.75 1.64.894.701.149 27.363.149 28.064 0 .68-.144 1.141-.395 1.64-.894.498-.499.75-.96.894-1.639.148-.7.148-20.698 0-21.398-.247-1.166-1.012-2.028-2.174-2.447l-.425-.154-13.734-.009c-7.553-.005-13.894.015-14.09.044m25.42 3.322c-.36.322-11.453 9.356-11.52 9.382-.053.02-2.496-1.933-5.85-4.676a5126.162 5126.162 0 0 1-5.787-4.737C8.39 10.012 13.609 10 20.002 10c6.394 0 11.596.025 11.561.057m-18.93 7.739c4.168 3.413 5.578 4.531 5.934 4.707a3.191 3.191 0 0 0 2.888-.008c.319-.161 1.986-1.485 5.912-4.7 3.006-2.461 5.579-4.565 5.716-4.674l.25-.199V30H6.667V12.922l.25.199c.137.109 2.71 2.213 5.716 4.675" />
    </svg>
  );
};
export default IcoEmail40;
