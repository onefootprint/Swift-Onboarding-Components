import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoFacebook16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
          d="M6.39 14.47v-4.433H5.014V8H6.39v-.878c0-2.269 1.026-3.32 3.253-3.32.421 0 1.15.083 1.448.165v1.846a8.912 8.912 0 0 0-.77-.024c-1.094 0-1.516.413-1.516 1.49V8h2.18l-.374 2.037H8.808v4.581a6.667 6.667 0 1 0-2.419-.148Z"
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
export default IcoFacebook16;
