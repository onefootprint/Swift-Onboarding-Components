import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoUserCircle24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M10.842 3.625A8.48 8.48 0 0 0 4.42 8.26c-.597 1.214-.865 2.373-.865 3.74s.268 2.526.865 3.74c.418.85.847 1.453 1.533 2.157a8.447 8.447 0 0 0 3.467 2.156c1.402.452 3.007.518 4.48.185 2.442-.553 4.568-2.237 5.68-4.498a8.48 8.48 0 0 0 .803-2.608c.081-.567.081-1.697 0-2.264a8.462 8.462 0 0 0-7.275-7.246c-.583-.076-1.693-.075-2.266.003m2.298 1.521c1.923.298 3.725 1.509 4.783 3.215.923 1.489 1.245 3.383.871 5.119a7.062 7.062 0 0 1-1.378 2.885l-.218.273-.249-.251c-1.025-1.036-2.358-1.703-3.849-1.927-.841-.126-2.113-.064-2.92.142a6.817 6.817 0 0 0-3.129 1.785l-.249.251-.216-.269a6.978 6.978 0 0 1-.928-7.21A7.064 7.064 0 0 1 8.421 6.04a7.273 7.273 0 0 1 3.099-.975c.369-.025 1.198.016 1.62.081m-1.864 1.812c-.19.04-.502.147-.694.237-1.267.594-2.025 1.76-2.028 3.125a3.327 3.327 0 0 0 .571 1.921 3.502 3.502 0 0 0 2.031 1.448c.43.118 1.258.118 1.688 0 2.263-.617 3.3-3.141 2.112-5.14a3.87 3.87 0 0 0-.429-.556 3.463 3.463 0 0 0-3.251-1.035m1.535 1.596c1.514.734 1.515 2.834.002 3.556-.31.149-.318.15-.813.15-.495 0-.503-.001-.813-.15-1.407-.671-1.534-2.592-.226-3.43.362-.233.565-.282 1.099-.27.449.011.497.021.751.144m.378 7.443a5.378 5.378 0 0 1 2.621 1.373c.127.123.23.241.23.263 0 .063-.54.394-1.02.626a6.917 6.917 0 0 1-6.04.001c-.481-.233-1.02-.564-1.02-.627 0-.022.103-.14.228-.263.799-.779 1.909-1.303 3.076-1.45.459-.058 1.463-.018 1.925.077"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoUserCircle24;
