import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoChevronRightBig24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M9.18 4.663c-.285.148-.42.366-.42.678 0 .101.029.241.064.311s1.461 1.528 3.17 3.238L15.1 12l-3.106 3.11c-1.709 1.71-3.135 3.168-3.17 3.238a.909.909 0 0 0-.022.599c.135.358.572.547.966.417.096-.032 1.029-.941 3.338-3.254 1.763-1.765 3.236-3.27 3.273-3.344a1.72 1.72 0 0 0 0-1.532c-.088-.175-6.399-6.495-6.564-6.574-.165-.078-.482-.076-.635.003"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoChevronRightBig24;
