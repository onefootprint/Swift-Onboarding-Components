import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoWork24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M8.78 3.632a1.7 1.7 0 0 0-.712.498c-.32.396-.347.529-.348 1.738v1.008l-1.49.012-1.49.012-.262.124c-.32.152-.654.474-.783.755a2.147 2.147 0 0 0-.133.482c-.052.36-.055 9.618-.003 9.976.1.696.64 1.252 1.321 1.361.36.057 13.88.057 14.24 0a1.6 1.6 0 0 0 1.322-1.384c.05-.388.047-9.602-.004-9.954a1.599 1.599 0 0 0-.916-1.236L19.26 6.9l-1.49-.012-1.49-.012V5.864c0-.88-.01-1.041-.075-1.238-.136-.414-.42-.729-.844-.937l-.221-.109-3.08-.009c-2.844-.009-3.095-.004-3.28.061m6.011 2.338.011.91H9.2v-.893c0-.492.012-.906.027-.921.015-.014 1.27-.022 2.79-.016l2.763.01.011.91m4.159 7.28-.01 4.85H5.06l-.01-4.85-.01-4.85h13.92l-.01 4.85"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoWork24;
