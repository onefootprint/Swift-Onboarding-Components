import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoPlusBig16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M7.869 1.897a.608.608 0 0 0-.482.501c-.017.09-.027 1.035-.027 2.566v2.423H4.851c-2.316 0-2.517.003-2.606.045a.63.63 0 0 0-.353.693.656.656 0 0 0 .334.434l.133.068 2.499.007 2.5.008.008 2.499.007 2.499.063.127a.63.63 0 0 0 .402.33.622.622 0 0 0 .721-.323l.068-.133.007-2.499.008-2.5 2.5-.008 2.499-.007.133-.068c.374-.193.465-.694.177-.981-.205-.206.003-.191-2.801-.191H8.642l-.008-2.514-.007-2.513-.062-.126a.621.621 0 0 0-.696-.337"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoPlusBig16;
