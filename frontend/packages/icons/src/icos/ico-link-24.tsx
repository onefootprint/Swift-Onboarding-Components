import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoLink24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M13.62 3.823a5.909 5.909 0 0 0-2.637 1.13c-.43.331-1.295 1.201-1.345 1.353-.099.3-.034.605.173.804.159.154.301.21.534.21.26 0 .383-.079.895-.577.578-.562.923-.823 1.38-1.045a4.253 4.253 0 0 1 4.877.805 4.25 4.25 0 0 1 .799 4.884c-.23.468-.48.798-1.039 1.373-.498.512-.577.635-.577.895 0 .233.056.375.21.534.199.207.504.272.806.172.177-.058 1.141-1.046 1.477-1.514.435-.605.797-1.433.966-2.207.091-.414.124-1.391.063-1.851a5.73 5.73 0 0 0-1.621-3.322c-1.127-1.126-2.547-1.713-4.121-1.702a7.043 7.043 0 0 0-.84.058M6.248 9.667c-.179.088-1.134 1.087-1.421 1.487-.435.604-.797 1.43-.967 2.206-.09.412-.124 1.441-.062 1.876.377 2.629 2.377 4.62 4.991 4.966.46.061 1.437.028 1.851-.063a6.277 6.277 0 0 0 2.207-.966c.179-.128.585-.485.903-.793.524-.508.583-.578.628-.758.122-.483-.17-.899-.655-.934-.318-.023-.409.033-1.032.634-.564.544-.899.792-1.375 1.016a4.24 4.24 0 0 1-4.868-.895c-1.232-1.262-1.536-3.219-.751-4.823.226-.46.488-.806 1.046-1.38.498-.512.577-.635.577-.895 0-.447-.302-.746-.749-.744-.105 0-.25.03-.323.066m7.092-.001c-.178.092-3.618 3.532-3.684 3.683a.97.97 0 0 0-.013.598c.057.154.23.331.386.398a.985.985 0 0 0 .598.013c.144-.054 3.632-3.534 3.713-3.703a.945.945 0 0 0 .017-.602.803.803 0 0 0-.386-.398c-.169-.073-.481-.067-.631.011"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoLink24;
