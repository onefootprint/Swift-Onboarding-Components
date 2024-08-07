import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoSearchSmall16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="m6.987 2.817-.267.039a4.63 4.63 0 0 0-1.68.605C3.629 4.329 2.8 5.795 2.8 7.423c0 1.636.819 3.1 2.221 3.97.713.443 1.52.666 2.406.667.622 0 1.087-.083 1.658-.296.349-.13.854-.403 1.062-.574l.08-.066.92.914c1.016 1.01 1.03 1.02 1.318.997a.63.63 0 0 0 .534-.842c-.039-.106-.197-.277-.961-1.046l-.914-.92.066-.08c.085-.104.301-.461.408-.676.182-.362.342-.873.419-1.335.056-.336.057-1.076.002-1.403-.172-1.014-.587-1.838-1.28-2.543a4.564 4.564 0 0 0-3.347-1.386 6.47 6.47 0 0 0-.405.013m1.002 1.276a3.405 3.405 0 0 1 2.774 2.736c.096.542.04 1.235-.14 1.737A3.395 3.395 0 0 1 6.23 10.6a3.432 3.432 0 0 1-2.015-2.112c-.229-.682-.214-1.526.038-2.226.388-1.075 1.375-1.926 2.481-2.139L7 4.071c.132-.028.768-.014.989.022"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoSearchSmall16;
