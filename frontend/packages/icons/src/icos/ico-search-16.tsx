import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoSearch16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M6.96 1.895A5.465 5.465 0 0 0 2.782 4.32c-.653.974-.987 2.244-.893 3.396.14 1.728 1.007 3.214 2.431 4.169.974.653 2.244.987 3.396.893a5.452 5.452 0 0 0 2.918-1.097l.087-.065 1.219 1.216c1.198 1.195 1.223 1.217 1.374 1.261a.61.61 0 0 0 .778-.417c.051-.173.051-.193-.001-.371-.041-.139-.094-.196-1.259-1.365l-1.216-1.219.065-.087c.306-.414.497-.746.68-1.181a5.424 5.424 0 0 0 0-4.239 5.193 5.193 0 0 0-1.173-1.735C10.056 2.35 8.573 1.795 6.96 1.895m.683 1.251a4.135 4.135 0 0 1 2.66 1.217 4.125 4.125 0 0 1 1.216 2.654c.175 2.308-1.518 4.294-3.844 4.506-1.739.159-3.444-.844-4.166-2.452a4.142 4.142 0 0 1-.361-2.051c.043-.571.124-.886.362-1.424a4.196 4.196 0 0 1 3.583-2.458 6.2 6.2 0 0 0 .187-.012c.022-.003.186.007.363.02"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoSearch16;
