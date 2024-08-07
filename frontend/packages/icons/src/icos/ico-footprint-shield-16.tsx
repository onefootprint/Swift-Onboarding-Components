import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoFootprintShield16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      <path d="M4.547 2.604c-1.819.874-3.34 1.612-3.381 1.641-.104.074-.16.199-.159.354.002.342.283 1.839.525 2.801.861 3.429 2.237 5.808 3.989 6.896a4.687 4.687 0 0 0 4.925.004c.817-.508 1.621-1.374 2.241-2.413 1.056-1.77 1.841-4.204 2.245-6.956.06-.407.048-.506-.074-.638-.05-.054-1.06-.552-3.405-1.679-3.039-1.459-3.346-1.601-3.467-1.6-.12 0-.442.149-3.439 1.59m5.906 2.703v.641l-.103-.053a1.128 1.128 0 0 0-1.527.697 1.133 1.133 0 0 0 .61 1.361.921.921 0 0 0 .407.094c.218.011.335-.012.567-.112.043-.019.046.013.046.475v.497h-.62c-.694.001-.874.026-1.135.157a1.544 1.544 0 0 0-.601.585c-.155.295-.176.437-.177 1.171v.647H5.947v-6.8h4.506v.64" />
    </svg>
  );
};
export default IcoFootprintShield16;
