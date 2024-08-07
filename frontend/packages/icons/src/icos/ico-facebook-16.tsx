import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoFacebook16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      <path d="M7.413 1.359c-1.202.121-2.275.512-3.226 1.178a6.667 6.667 0 0 0-2.854 5.48c0 1.481.521 2.962 1.458 4.143a8.7 8.7 0 0 0 1.036 1.04c.5.396 1.122.76 1.68.981.302.121.774.272.845.272.046 0 .048-.104.048-2.2v-2.2H5.013V8H6.394l.013-.807c.014-.855.035-1.042.168-1.503.163-.562.516-1.068.954-1.367.35-.24.906-.421 1.481-.484.51-.056 1.448-.008 1.963.101l.107.022.007.919.007.919-.594.001c-.643.001-.816.026-1.098.159a1.083 1.083 0 0 0-.443.449c-.115.26-.138.414-.152 1.011L8.794 8h2.194l-.015.06c-.02.085-.36 1.948-.36 1.973 0 .011-.408.02-.906.02H8.8v2.28c0 2.171.002 2.28.048 2.28.112 0 .683-.118.974-.202 3.334-.96 5.381-4.287 4.721-7.676-.494-2.54-2.433-4.588-4.923-5.199-.656-.162-1.602-.237-2.207-.177" />
    </svg>
  );
};
export default IcoFacebook16;
