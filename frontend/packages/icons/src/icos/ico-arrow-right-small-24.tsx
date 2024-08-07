import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoArrowRightSmall24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M13.58 6.26a2.274 2.274 0 0 1-.149.037c-.147.032-.39.251-.457.411a.83.83 0 0 0 .002.583c.032.073.882.953 1.96 2.029l1.904 1.9-5.85.02-5.85.02-.18.106c-.553.325-.459 1.138.156 1.348.101.034 1.642.046 5.94.046h5.804l-1.928 1.93c-1.061 1.062-1.947 1.981-1.97 2.043a.892.892 0 0 0 .001.534c.089.237.435.49.672.492.333.003.297.035 2.98-2.636 1.405-1.399 2.606-2.623 2.67-2.721a.724.724 0 0 0-.001-.804c-.148-.229-5.105-5.171-5.264-5.249-.127-.062-.372-.112-.44-.089"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoArrowRightSmall24;
