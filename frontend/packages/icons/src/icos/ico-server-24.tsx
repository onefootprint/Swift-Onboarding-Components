import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoServer24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M4.852 5.24c-.287.042-.554.18-.802.413a1.515 1.515 0 0 0-.452.728c-.087.299-.087 10.94 0 11.239a1.62 1.62 0 0 0 1.237 1.139c.297.056 14.033.056 14.33 0a1.62 1.62 0 0 0 1.237-1.139c.087-.299.087-10.94 0-11.239a1.515 1.515 0 0 0-.452-.728 1.451 1.451 0 0 0-.838-.415c-.304-.044-13.959-.042-14.26.002M18.95 8.99l.011 2.25H5.04V9.007c0-1.229.012-2.246.027-2.26.015-.015 3.142-.023 6.95-.017l6.923.01.01 2.25M7.08 8.224c-.678.294-.636 1.306.063 1.537A.856.856 0 0 0 8.15 9.36a.843.843 0 0 0-.052-.846.857.857 0 0 0-1.018-.29m11.87 6.786-.01 2.25H5.06l-.01-2.25-.011-2.25h13.922l-.011 2.25m-11.87-.746c-.678.294-.636 1.306.063 1.537A.856.856 0 0 0 8.15 15.4a.843.843 0 0 0-.052-.846.857.857 0 0 0-1.018-.29"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoServer24;
