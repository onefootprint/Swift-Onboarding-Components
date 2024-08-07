import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoClose16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M3.049 2.563c-.373.068-.582.417-.476.789.044.154.054.165 2.289 2.401L7.106 8l-2.244 2.247c-2.235 2.236-2.245 2.247-2.289 2.401a.62.62 0 0 0 .779.779c.154-.044.165-.054 2.401-2.289L8 8.894l2.247 2.244c2.183 2.181 2.25 2.245 2.391 2.286.179.053.199.053.371.002a.617.617 0 0 0 .418-.777c-.044-.155-.048-.16-2.289-2.402L8.894 8l2.244-2.247c2.181-2.183 2.245-2.25 2.286-2.391.053-.179.053-.199.002-.371a.597.597 0 0 0-.6-.436.692.692 0 0 0-.256.047c-.07.031-.826.768-2.337 2.275L8 7.106 5.767 4.877C4.352 3.465 3.499 2.633 3.44 2.608a.656.656 0 0 0-.391-.045"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoClose16;
