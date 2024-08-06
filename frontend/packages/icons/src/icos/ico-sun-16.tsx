import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoSun16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        <g clipPath="url(#prefix__b)">
          <path
            d="M7.999 2.194V1.178M3.893 12.106l-.718.718M8 14.822v-1.016m4.823-10.63-.718.719M13.804 8h1.016m-2.716 4.106.718.718M1.177 8h1.016m.982-4.824.718.718m6.58 1.631a3.5 3.5 0 1 1-4.949 4.95 3.5 3.5 0 0 1 4.95-4.95Z"
            stroke={theme.color[color]}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </g>
      <defs>
        <clipPath id="prefix__a">
          <path fill="#fff" d="M0 0h16v16H0z" />
        </clipPath>
        <clipPath id="prefix__b">
          <path fill="#fff" d="M0 0h16v16H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};
export default IcoSun16;
