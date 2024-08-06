import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoStar24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={24}
      height={24}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
      data-colored={false}
    >
      <path
        d="M11.625 3.694c.15-.314.6-.314.75 0l2.14 4.462c.061.127.182.214.322.232l4.926.646a.414.414 0 0 1 .232.713l-3.603 3.4a.414.414 0 0 0-.123.378l.905 4.859a.416.416 0 0 1-.607.44l-4.369-2.359a.417.417 0 0 0-.396 0l-4.369 2.359a.416.416 0 0 1-.607-.44l.905-4.86a.414.414 0 0 0-.123-.376L4.005 9.747a.414.414 0 0 1 .232-.713l4.926-.646a.416.416 0 0 0 .321-.232l2.14-4.462Z"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoStar24;
