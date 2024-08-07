import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoArrowUpRight16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M5.715 3.228a.605.605 0 0 0-.442.332.63.63 0 0 0 .312.843c.103.047.231.049 2.588.05h2.48L7.09 8.02c-1.959 1.962-3.591 3.609-3.626 3.66-.055.08-.064.125-.064.32 0 .208.006.236.078.335.128.178.26.256.457.272.344.027.034.31 4.018-3.67l3.594-3.59v2.48c.001 2.357.003 2.485.05 2.588a.625.625 0 0 0 1.036.163c.176-.201.169-.036.161-3.647l-.007-3.264-.058-.107a.668.668 0 0 0-.316-.299c-.1-.045-.287-.048-3.346-.052-1.782-.002-3.29.006-3.352.019"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoArrowUpRight16;
