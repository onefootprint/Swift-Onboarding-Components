import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoApple24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M18.67 7.965a3.965 3.965 0 0 0-1.895 3.335 3.858 3.858 0 0 0 2.348 3.538 9.218 9.218 0 0 1-1.202 2.484c-.749 1.078-1.531 2.155-2.722 2.155s-1.497-.692-2.87-.692c-1.338 0-1.815.715-2.903.715-1.09 0-1.85-.998-2.722-2.223a10.744 10.744 0 0 1-1.827-5.796c0-3.402 2.212-5.206 4.39-5.206 1.157 0 2.12.76 2.847.76.692 0 1.77-.805 3.085-.805a4.127 4.127 0 0 1 3.47 1.735ZM14.574 4.79a3.91 3.91 0 0 0 .93-2.438A1.686 1.686 0 0 0 15.471 2a3.919 3.919 0 0 0-2.575 1.327 3.803 3.803 0 0 0-.964 2.37c0 .107.012.214.034.318.079.015.159.023.238.023a3.397 3.397 0 0 0 2.37-1.249Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoApple24;
