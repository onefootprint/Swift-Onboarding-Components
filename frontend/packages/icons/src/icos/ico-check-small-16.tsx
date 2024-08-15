import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoCheckSmall16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M11.853 4.157a.895.895 0 0 0-.166.066c-.053.028-1.083 1.198-2.7 3.068l-2.615 3.023L5.37 9.306C4.253 8.182 4.235 8.168 3.945 8.194a.65.65 0 0 0-.417.21.636.636 0 0 0-.083.678c.037.071.552.614 1.315 1.388 1.394 1.414 1.398 1.418 1.683 1.389a.831.831 0 0 0 .256-.077c.083-.046.832-.895 2.96-3.355 1.566-1.812 2.873-3.345 2.904-3.408a.65.65 0 0 0-.045-.597c-.147-.209-.436-.324-.665-.265"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoCheckSmall16;
