import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoArrowLeftSmall24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M10.694 7.84a1.047 1.047 0 0 0-.26.112c-.074.046-.921.872-1.882 1.836-1.192 1.194-1.768 1.799-1.81 1.901a.816.816 0 0 0 .017.648c.052.107.692.775 1.85 1.931 1.922 1.919 1.98 1.967 2.327 1.915.45-.068.73-.47.646-.93-.024-.133-.178-.304-1.194-1.323l-1.166-1.17h7.482l.198-.099c.289-.145.398-.326.398-.661 0-.316-.102-.5-.359-.648l-.161-.092-3.77-.02-3.771-.02 1.125-1.12c.618-.616 1.149-1.178 1.18-1.249.237-.545-.263-1.141-.85-1.011"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoArrowLeftSmall24;
