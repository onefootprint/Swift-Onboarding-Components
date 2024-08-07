import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoChevronLeftBig16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M9.733 2.109c-.093.041-.675.608-2.581 2.512-1.354 1.353-2.514 2.528-2.579 2.613a1.176 1.176 0 0 0-.246.673c-.017.259.022.462.132.686.073.149.343.429 2.565 2.655 1.365 1.369 2.54 2.531 2.611 2.584a.454.454 0 0 0 .299.108c.263.021.42-.051.587-.271.073-.097.079-.121.079-.334 0-.197-.009-.241-.064-.322-.035-.051-1.169-1.2-2.52-2.553L5.56 8l2.456-2.46c1.351-1.353 2.485-2.502 2.52-2.553.055-.081.064-.125.064-.322 0-.213-.006-.237-.079-.334a.57.57 0 0 0-.268-.225.675.675 0 0 0-.52.003"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoChevronLeftBig16;
