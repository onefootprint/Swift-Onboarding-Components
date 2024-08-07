import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoHome16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M7.733.409c-.187.044-.3.095-.466.208-.198.134-4.944 4.026-5.057 4.147a1.351 1.351 0 0 0-.28.489c-.048.141-.05.306-.05 3.76 0 3.87-.004 3.753.135 4.037.143.292.443.55.752.648.146.046.397.049 5.233.049 4.836 0 5.087-.003 5.233-.049.307-.097.611-.358.748-.643.144-.298.139-.149.139-4.042 0-3.454-.002-3.619-.05-3.76a1.351 1.351 0 0 0-.28-.489C13.667 4.632 8.918.741 8.714.605c-.29-.194-.67-.27-.981-.196m2.715 3.207 2.432 1.99v3.39c-.001 1.865-.008 3.418-.017 3.451l-.016.06H3.153l-.016-.06c-.009-.033-.016-1.586-.017-3.451v-3.39l2.432-1.99A237.187 237.187 0 0 1 8 1.627c.009 0 1.111.895 2.448 1.989"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoHome16;
