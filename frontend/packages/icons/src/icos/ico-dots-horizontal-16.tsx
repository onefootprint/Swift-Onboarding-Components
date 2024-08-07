import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoDotsHorizontal16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M3.651 6.716a1.362 1.362 0 0 0-.945.956c-.078.303-.037.656.111.948.091.179.384.472.563.563.393.199.847.199 1.24 0 .179-.091.472-.384.563-.563a1.317 1.317 0 0 0-.206-1.518 1.315 1.315 0 0 0-1.326-.386m4 0a1.362 1.362 0 0 0-.945.956c-.078.303-.037.656.111.948.091.179.384.472.563.563.393.199.847.199 1.24 0 .179-.091.472-.384.563-.563a1.317 1.317 0 0 0-.206-1.518 1.315 1.315 0 0 0-1.326-.386m4 0a1.362 1.362 0 0 0-.945.956c-.078.303-.037.656.111.948.091.179.384.472.563.563.393.199.847.199 1.24 0 .179-.091.472-.384.563-.563a1.317 1.317 0 0 0-.206-1.518 1.315 1.315 0 0 0-1.326-.386"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoDotsHorizontal16;
