import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoEmail16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      <path d="M2.298 2.562c-.361.047-.757.329-.937.667-.167.313-.16.107-.161 4.759 0 2.955.009 4.29.029 4.4.097.523.529.956 1.049 1.05.222.04 11.222.04 11.444 0 .52-.094.952-.527 1.049-1.05.041-.222.041-8.554 0-8.776a1.31 1.31 0 0 0-1.093-1.051c-.244-.032-11.136-.031-11.38.001M13.54 4.373l.007.574-2.752 1.386C9.282 7.096 8.023 7.72 7.999 7.72c-.024 0-1.282-.624-2.795-1.387L2.453 4.947v-.563c0-.309.008-.57.018-.58.01-.009 2.503-.014 5.54-.011l5.522.007.007.573M5.019 7.639c1.525.767 2.577 1.281 2.673 1.306.202.053.414.053.616 0 .096-.025 1.147-.538 2.672-1.306a183.492 183.492 0 0 1 2.54-1.266c.018 0 .025.988.02 2.914l-.007 2.913H2.467L2.46 9.287c-.004-1.882.002-2.914.019-2.914.014 0 1.157.57 2.54 1.266" />
    </svg>
  );
};
export default IcoEmail16;
