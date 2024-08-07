import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoChevronRight24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M10.015 7.994c-.317.149-.468.482-.397.874.024.134.207.332 1.514 1.642L12.619 12l-1.487 1.49c-1.619 1.623-1.569 1.558-1.522 1.972.053.471.604.754 1.048.539.107-.052.699-.616 1.711-1.631 1.783-1.789 1.771-1.773 1.771-2.37 0-.595.008-.585-1.731-2.33-.829-.831-1.577-1.56-1.66-1.618a.772.772 0 0 0-.734-.058"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoChevronRight24;
