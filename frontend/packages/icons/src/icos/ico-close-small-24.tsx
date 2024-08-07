import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoCloseSmall24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M8.38 7.976a.748.748 0 0 0-.399.975c.042.101.529.617 1.51 1.599L10.94 12l-1.449 1.45c-.981.982-1.468 1.498-1.51 1.599a.741.741 0 0 0 .594 1.02c.362.041.376.031 1.955-1.543L12 13.061l1.47 1.465c1.579 1.574 1.593 1.584 1.955 1.543a.741.741 0 0 0 .594-1.02c-.042-.101-.529-.617-1.51-1.599L13.06 12l1.449-1.45c.981-.982 1.468-1.498 1.51-1.599.241-.584-.318-1.184-.924-.991-.123.039-.463.356-1.625 1.514l-1.471 1.465-1.449-1.448c-.982-.981-1.498-1.468-1.599-1.51a.777.777 0 0 0-.571-.005"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoCloseSmall24;
