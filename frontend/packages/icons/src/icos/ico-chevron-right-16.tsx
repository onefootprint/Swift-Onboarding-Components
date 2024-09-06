import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoChevronRight16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M6.099 3.708a.622.622 0 0 0-.417.852c.041.092.442.509 1.712 1.78L9.053 8 7.394 9.66c-1.27 1.271-1.671 1.688-1.712 1.78a.614.614 0 0 0 .13.688.596.596 0 0 0 .632.155c.118-.039.3-.213 1.96-1.876 1.75-1.754 1.832-1.841 1.89-1.994.116-.313.093-.685-.06-.946-.078-.133-3.587-3.647-3.701-3.706a.691.691 0 0 0-.434-.053"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoChevronRight16;
