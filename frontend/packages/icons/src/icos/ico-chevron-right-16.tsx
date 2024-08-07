import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoChevronRight16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M6.413 4.772a.576.576 0 0 0-.267.226c-.074.097-.079.121-.079.333 0 .198.008.242.064.322.035.052.569.601 1.186 1.22L8.439 8 7.317 9.127c-.618.619-1.151 1.168-1.187 1.22-.054.08-.063.124-.063.32 0 .208.006.235.078.335.128.178.259.256.457.272.329.026.274.07 1.737-1.391C9.853 8.371 9.8 8.44 9.8 8c0-.439.051-.372-1.448-1.872-.986-.986-1.328-1.312-1.419-1.353a.68.68 0 0 0-.52-.003"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoChevronRight16;
