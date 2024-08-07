import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoFileText216 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M3.627 1.229c-.487.063-.934.482-1.053.987-.06.255-.061 11.309 0 11.565.056.239.157.42.337.609.187.194.406.318.655.371.267.056 8.598.057 8.864.001.508-.108.924-.54 1.008-1.047.022-.131.028-1.206.023-3.848L13.453 6.2l-.062-.175a1.55 1.55 0 0 0-.191-.347c-.071-.094-1.045-1.085-2.165-2.201C9.079 1.526 8.992 1.443 8.8 1.35a1.254 1.254 0 0 0-.4-.123c-.245-.031-4.529-.029-4.773.002m4.24 2.804c0 1.715.004 1.767.15 2.053.095.19.353.45.544.552.292.156.359.161 2.086.162h1.567l-.007 3.367-.007 3.366H3.8l-.007-5.506c-.004-3.029-.001-5.522.006-5.54.01-.027.443-.034 2.04-.034h2.028v1.58m2.38 1.507c-.583.004-1.075.002-1.094-.006-.026-.009-.033-.254-.033-1.1V3.347l1.093 1.093 1.094 1.093-1.06.007"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoFileText216;
