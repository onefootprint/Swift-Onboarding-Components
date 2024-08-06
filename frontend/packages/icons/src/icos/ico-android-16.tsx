import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoAndroid16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
          d="M5.384 1.013c-.039.007-.079.014-.113.037a.305.305 0 0 0-.075.422l.647.965c-1 .53-1.745 1.41-1.987 2.465h8.286c-.243-1.055-.988-1.935-1.987-2.465l.646-.965a.305.305 0 0 0-.075-.422.307.307 0 0 0-.422.085l-.712 1.05a4.64 4.64 0 0 0-3.187 0l-.712-1.05a.301.301 0 0 0-.31-.122Zm.965 2.39a.45.45 0 1 1 0 .9.45.45 0 0 1 0-.9Zm3.3 0a.45.45 0 1 1 0 .898.45.45 0 0 1 0-.898Zm-6.75 2.1a.9.9 0 0 0-.899.9V10.6a.9.9 0 0 0 .9.9.88.88 0 0 0 .3-.056V5.559a.88.88 0 0 0-.3-.057Zm.9 0V12.1c0 .495.405.9.9.9h6.599c.496 0 .9-.405.9-.9V5.502H3.8Zm9.299 0a.88.88 0 0 0-.3.056v5.886a.907.907 0 0 0 .3.056.9.9 0 0 0 .9-.9V6.402a.9.9 0 0 0-.9-.9ZM4.999 13.6v1.2a1.2 1.2 0 0 0 2.4 0v-1.2h-2.4Zm3.6 0v1.2a1.2 1.2 0 0 0 2.399 0v-1.2h-2.4Z"
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
export default IcoAndroid16;
