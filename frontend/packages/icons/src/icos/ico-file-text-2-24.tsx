import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoFileText224 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M6.318 3.618c-.585.216-.971.654-1.077 1.217-.056.297-.056 14.033 0 14.33a1.62 1.62 0 0 0 1.139 1.237c.3.087 10.94.087 11.24 0a1.62 1.62 0 0 0 1.139-1.237c.056-.295.056-9.115 0-9.41-.088-.466-.079-.457-2.933-3.303-2.351-2.346-2.713-2.691-2.906-2.776l-.22-.096-3.12-.008c-2.499-.006-3.148.003-3.262.046m5.562 3.455c0 2.265.001 2.274.272 2.683.079.118.25.294.38.389.425.314.385.309 2.698.326l2.05.014-.01 4.228-.01 4.227H6.74l-.01-6.9c-.006-3.795-.002-6.923.008-6.95.015-.039.569-.05 2.581-.05h2.561v2.033m2.94.487 1.4 1.4H13.4v-1.4c0-.77.005-1.4.01-1.4.006 0 .64.63 1.41 1.4"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoFileText224;
