import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoEnter24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M18.78 5.219a1.438 1.438 0 0 1-.147.037c-.138.031-.337.199-.424.359-.064.115-.071.451-.089 4.225l-.02 4.1-5.579.01-5.579.01 1.084-1.09c1.172-1.178 1.201-1.217 1.165-1.593-.046-.474-.609-.784-1.046-.577-.069.033-.93.866-1.913 1.85-1.589 1.592-1.791 1.809-1.831 1.963-.054.206-.027.37.1.587.051.088.873.935 1.826 1.883 1.809 1.798 1.834 1.819 2.158 1.816.237-.002.583-.255.672-.492a.892.892 0 0 0 .001-.534c-.023-.062-.531-.604-1.13-1.203l-1.087-1.09 5.519-.001c3.181 0 5.629-.016 5.777-.038A1.602 1.602 0 0 0 19.6 14.1c.028-.188.039-1.599.031-4.3-.011-3.989-.012-4.021-.095-4.18a.884.884 0 0 0-.24-.267c-.142-.098-.417-.169-.516-.134"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoEnter24;
