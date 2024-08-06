import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoKey16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={16}
      height={16}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
      data-colored={false}
    >
      <path
        d="M10.333 9.5a3.833 3.833 0 1 0-3.719-2.902l-3.919 3.919a.667.667 0 0 0-.195.471v1.845c0 .368.298.667.667.667h1.845c.177 0 .346-.07.471-.195l.684-.684v-1.788h1.788l1.447-1.447c.298.074.61.114.931.114Z"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.5 5.667a1.167 1.167 0 1 1-2.333 0 1.167 1.167 0 0 1 2.333 0Z"
        stroke={theme.color[color]}
        strokeWidth={1.2}
        strokeLinecap="square"
      />
    </svg>
  );
};
export default IcoKey16;
