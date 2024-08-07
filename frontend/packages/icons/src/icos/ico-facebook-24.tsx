import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoFacebook24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      <path d="M11.04 3.724c-3.46.393-6.359 2.979-7.155 6.384a8.689 8.689 0 0 0 0 3.784 8.38 8.38 0 0 0 4.455 5.591c.442.215 1.218.507 1.53.575l.13.028V14.56H8.28V12H9.991l.02-1.05c.023-1.141.082-1.566.297-2.11.251-.635.724-1.22 1.226-1.517.329-.193.876-.39 1.312-.471.523-.097 1.804-.097 2.425 0 .247.039.477.081.51.094.05.019.059.191.059 1.168V9.26h-.77c-.684 0-.801.01-1.052.089-.497.156-.745.401-.904.891-.07.214-.088.393-.104 1.01l-.02.75h2.739l-.021.11-.234 1.28-.214 1.17H13v5.721l.17-.024a10.566 10.566 0 0 0 1.544-.383 8.304 8.304 0 0 0 5.606-7.84c0-1.022-.115-1.745-.424-2.674A8.325 8.325 0 0 0 12.9 3.721a12.158 12.158 0 0 0-1.86.003" />
    </svg>
  );
};
export default IcoFacebook24;
