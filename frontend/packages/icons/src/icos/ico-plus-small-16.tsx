import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoPlusSmall16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M7.869 3.897a.608.608 0 0 0-.482.501c-.016.085-.027.713-.027 1.566v1.423H5.851c-1.371 0-1.518.004-1.606.045a.63.63 0 0 0-.353.693.656.656 0 0 0 .334.434l.132.068 1.5.008 1.5.007.007 1.5.008 1.5.068.132a.622.622 0 0 0 .721.323.63.63 0 0 0 .402-.33l.063-.127.008-1.499.007-1.499 1.5-.007 1.5-.008.132-.068c.374-.193.465-.694.177-.981-.2-.2-.115-.191-1.8-.191H8.642l-.007-1.514-.008-1.513-.062-.126a.621.621 0 0 0-.696-.337"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoPlusSmall16;
