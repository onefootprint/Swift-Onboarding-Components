import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoArrowUp16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M7.907 1.438c-.156.073-4.423 4.351-4.481 4.492a.626.626 0 0 0 .449.845.472.472 0 0 0 .3-.014c.158-.045.163-.05 1.765-1.649l1.606-1.604.007 4.841.007 4.842.081.13c.265.429.852.392 1.096-.068.048-.089.05-.279.063-4.913l.013-4.82 1.574 1.575c.915.916 1.618 1.599 1.68 1.632a.658.658 0 0 0 .52.009c.342-.178.468-.567.282-.879-.095-.161-4.325-4.371-4.446-4.426a.74.74 0 0 0-.516.007"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoArrowUp16;
