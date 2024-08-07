import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoGlobe24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M11.12 3.82c-.956.14-1.82.403-2.62.796a8.441 8.441 0 0 0-4.683 6.554c-.082.644-.062 1.852.04 2.41.272 1.49.853 2.794 1.738 3.9.28.35.919.996 1.274 1.287 1.14.934 2.551 1.558 4.111 1.819.519.086 1.708.118 2.08.054.847-.144 1.193-.217 1.602-.341a8.715 8.715 0 0 0 2.592-1.303c.52-.38 1.362-1.222 1.742-1.742 1.935-2.651 2.208-6.041.719-8.939-.384-.749-.829-1.358-1.468-2.011a8.366 8.366 0 0 0-4.854-2.465c-.619-.091-1.719-.1-2.273-.019m1.554 1.564c.256.114.675.522.92.896.51.779.941 1.978 1.164 3.24.103.582.202 1.43.202 1.73v.23H9.431l.027-.35c.186-2.417.852-4.412 1.794-5.373.487-.498.9-.606 1.422-.373m-3.515.778c-.578 1.146-1.02 2.815-1.158 4.378l-.066.73-.021.21h-1.29c-.71 0-1.3-.009-1.31-.02-.031-.03.079-.682.171-1.02A6.98 6.98 0 0 1 8.94 6.074a2.37 2.37 0 0 1 .311-.153c.016-.001-.025.108-.092.241m6.69.126c.472.291.758.516 1.185.93a6.841 6.841 0 0 1 1.901 3.246c.079.32.185.885.185.994 0 .012-.592.022-1.315.022H16.49l-.027-.41c-.114-1.716-.486-3.321-1.069-4.609l-.221-.491c-.031-.072.288.078.676.318M7.936 13.17c.012.115.032.354.045.53.107 1.448.543 3.202 1.074 4.319.124.261.22.479.214.485-.027.027-.738-.384-1.079-.624a8.266 8.266 0 0 1-1.449-1.38 6.936 6.936 0 0 1-1.394-3.191l-.056-.349h2.623l.022.21m7.011.201c-.14 2.282-.874 4.412-1.84 5.339-.72.691-1.395.579-2.118-.351-.247-.318-.711-1.215-.889-1.719-.304-.859-.548-2.127-.643-3.35l-.025-.33h5.54l-.025.411m4.172-.381c0 .017-.026.188-.058.381-.319 1.949-1.518 3.716-3.241 4.779a5.46 5.46 0 0 1-.509.281l-.189.084.134-.268c.652-1.295 1.074-3.01 1.209-4.917l.026-.37h1.315c.723 0 1.314.013 1.313.03"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoGlobe24;
