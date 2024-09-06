import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoCheckSmall24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M16.42 7.596a.95.95 0 0 0-.213.087c-.051.031-1.392 1.542-2.98 3.357a8662.09 8662.09 0 0 1-2.995 3.42l-.108.12-1.152-1.146c-.634-.63-1.197-1.168-1.252-1.196-.14-.072-.515-.064-.665.014a.762.762 0 0 0-.317 1.022c.031.058.728.775 1.549 1.593 1.33 1.324 1.512 1.492 1.669 1.533a.8.8 0 0 0 .565-.061c.105-.054 6.59-7.436 6.738-7.67.109-.173.108-.521-.002-.709-.161-.275-.536-.439-.837-.364"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoCheckSmall24;
