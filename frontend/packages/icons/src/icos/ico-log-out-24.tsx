import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoLogOut24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      <path
        d="M5.652 4.674c-.569.197-.96.683-1.05 1.307-.055.38-.055 11.658 0 12.038.055.381.193.661.455.924.271.271.552.404.967.459.487.065 5.479.034 5.636-.035a.8.8 0 0 0 .459-.704.79.79 0 0 0-.331-.616l-.162-.107-2.763-.02L6.1 17.9V6.1l2.763-.02 2.763-.02.162-.107a.748.748 0 0 0 .27-.903.635.635 0 0 0-.346-.374c-.142-.073-.28-.076-3-.075-2.639.002-2.868.007-3.06.073m8.898 2.929a.803.803 0 0 0-.378.549c-.045.336-.011.379 1.381 1.777l1.303 1.309-3.878.011-3.878.011-.18.106c-.48.282-.494.94-.026 1.263l.159.111 3.902.011 3.902.011-1.304 1.309c-1.394 1.4-1.426 1.441-1.381 1.78a.84.84 0 0 0 .399.56.828.828 0 0 0 .672.009c.173-.086 3.886-3.778 4.041-4.018a.792.792 0 0 0 .052-.734c-.084-.167-3.781-3.881-4.014-4.032a.792.792 0 0 0-.772-.033"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoLogOut24;
