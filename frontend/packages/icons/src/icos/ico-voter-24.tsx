import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoVoter24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M4.852 5.24c-.287.042-.554.18-.802.413a1.515 1.515 0 0 0-.452.728c-.087.299-.087 10.94 0 11.239a1.62 1.62 0 0 0 1.237 1.139c.297.056 14.033.056 14.33 0a1.62 1.62 0 0 0 1.237-1.139c.087-.299.087-10.94 0-11.239a1.515 1.515 0 0 0-.452-.728 1.451 1.451 0 0 0-.838-.415c-.304-.044-13.959-.042-14.26.002M18.94 12v5.26H5.06l-.01-5.22c-.006-2.871-.002-5.243.009-5.27.015-.04 1.426-.048 6.95-.04l6.931.01V12M7.26 9.475c-.332.206-.466.57-.338.912.064.169.316.409.477.453.077.022.47.04.872.04.796 0 .927-.026 1.14-.231.16-.153.247-.474.188-.693-.063-.235-.144-.344-.338-.458-.164-.096-.187-.098-1.025-.098-.765 0-.869.008-.976.075"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoVoter24;
