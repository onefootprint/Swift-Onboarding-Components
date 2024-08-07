import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoDotsVertical16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M7.651 1.382c-.447.117-.826.5-.945.956a1.39 1.39 0 0 0 .111.949c.091.179.384.472.563.563.173.088.428.149.62.149s.447-.061.62-.149c.179-.091.472-.384.563-.563a1.317 1.317 0 0 0-.206-1.518 1.316 1.316 0 0 0-1.326-.387m0 5.334a1.362 1.362 0 0 0-.945.956c-.078.303-.037.656.111.948.091.179.384.472.563.563.393.199.847.199 1.24 0 .179-.091.472-.384.563-.563a1.317 1.317 0 0 0-.206-1.518 1.315 1.315 0 0 0-1.326-.386m0 5.333c-.447.117-.826.5-.945.956a1.39 1.39 0 0 0 .111.949c.091.179.384.472.563.562.173.089.428.15.62.15s.447-.061.62-.15c.179-.09.472-.383.563-.562a1.316 1.316 0 0 0-.206-1.518 1.316 1.316 0 0 0-1.326-.387"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoDotsVertical16;
