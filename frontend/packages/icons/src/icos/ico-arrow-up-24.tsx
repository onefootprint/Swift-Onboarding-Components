import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoArrowUp24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M11.598 4.715c-.098.064-1.324 1.265-2.724 2.67-2.677 2.686-2.635 2.639-2.633 2.975.002.242.252.587.492.677a.892.892 0 0 0 .534.001c.062-.023.981-.909 2.043-1.97l1.93-1.928v5.804c0 4.298.012 5.839.046 5.94A.728.728 0 0 0 12 19.4a.728.728 0 0 0 .714-.516c.034-.101.046-1.642.046-5.94V7.14l1.93 1.928c1.062 1.061 1.981 1.947 2.043 1.97a.892.892 0 0 0 .534-.001c.237-.089.49-.435.492-.672.003-.333.035-.297-2.636-2.98-1.399-1.405-2.623-2.606-2.721-2.67A.61.61 0 0 0 12 4.6a.61.61 0 0 0-.402.115"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoArrowUp24;
