import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoCheckSmall16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M12.387 3.689a1.293 1.293 0 0 0-.138.064c-.032.018-1.421 1.61-3.087 3.536l-3.029 3.503-1.18-1.185C4.25 8.901 3.731 8.4 3.668 8.368a.696.696 0 0 0-.523-.008c-.323.163-.459.542-.302.845.067.13 2.908 3.002 3.037 3.07.15.079.413.078.566-.003.087-.046.835-.894 3.386-3.845 1.801-2.082 3.299-3.831 3.328-3.887.111-.209.051-.555-.124-.718-.158-.148-.457-.209-.649-.133"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoCheckSmall16;
