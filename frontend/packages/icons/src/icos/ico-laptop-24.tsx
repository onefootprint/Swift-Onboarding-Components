import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoLaptop24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M5.652 4.674c-.575.2-.961.684-1.051 1.321-.027.187-.041 1.784-.041 4.439l.002 4.146-.571.02c-.617.022-.746.059-.907.265-.158.2-.17.335-.157 1.875l.013 1.48.107.229c.209.446.555.76.993.9.207.067.675.071 7.96.071 7.371 0 7.751-.003 7.97-.073.413-.131.78-.465.981-.895l.109-.232.013-1.48c.013-1.54.001-1.675-.157-1.875-.161-.206-.29-.243-.907-.265l-.571-.02.002-4.146c0-2.655-.014-4.252-.041-4.439a2.256 2.256 0 0 0-.138-.505c-.127-.277-.479-.626-.77-.762l-.231-.108-6.2-.009c-5.884-.008-6.211-.005-6.408.063M17.91 10.33l.01 4.23H6.08v-4.213c0-2.318.012-4.226.027-4.24.015-.015 2.674-.023 5.91-.017l5.883.01.01 4.23M19.56 17v.92H4.44v-1.84h15.12V17"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoLaptop24;
