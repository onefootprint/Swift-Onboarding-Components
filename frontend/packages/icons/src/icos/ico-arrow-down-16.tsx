import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoArrowDown16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M7.869 1.897a.608.608 0 0 0-.482.501c-.018.093-.027 1.775-.027 4.865v4.723l-1.607-1.603c-1.291-1.289-1.626-1.61-1.709-1.636a.89.89 0 0 0-.267-.022c-.28.017-.486.201-.553.492a.46.46 0 0 0 .015.291l.045.159 2.165 2.167c1.583 1.585 2.197 2.183 2.284 2.226.08.039.17.059.267.059s.187-.02.267-.059c.087-.043.701-.641 2.284-2.226l2.165-2.167.045-.159a.601.601 0 0 0-.25-.688.472.472 0 0 0-.288-.095.89.89 0 0 0-.267.022c-.083.026-.418.347-1.709 1.635l-1.606 1.603-.007-4.812-.007-4.813-.062-.126a.621.621 0 0 0-.696-.337"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoArrowDown16;
