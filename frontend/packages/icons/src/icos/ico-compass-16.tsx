import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoCompass16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M12.707 2.105c-.518.142-11.455 3.668-11.547 3.721a.959.959 0 0 0-.374 1.255c.08.165.291.37.448.438.062.027 1.337.406 2.833.842 1.496.436 2.733.807 2.749.823.016.016.387 1.253.823 2.749.437 1.496.823 2.782.858 2.857.076.163.285.366.451.44a.955.955 0 0 0 1.252-.443c.035-.074.89-2.708 1.899-5.854 1.813-5.654 1.834-5.722 1.833-5.935a.67.67 0 0 0-.086-.39c-.214-.435-.666-.634-1.139-.503M12.526 3.5l-1.582 4.932c-.864 2.694-1.579 4.89-1.588 4.88-.01-.01-.326-1.075-.703-2.365-.379-1.297-.716-2.404-.754-2.475a.993.993 0 0 0-.441-.404c-.076-.033-1.185-.365-2.464-.738-1.28-.372-2.327-.683-2.327-.69 0-.011 9.788-3.162 9.849-3.17.012-.002.016.012.01.03"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoCompass16;
