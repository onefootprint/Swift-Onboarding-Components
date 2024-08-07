import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoPassportCard16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M2.7 2.414c-.464.1-.879.529-.967.996-.036.197-.036 8.983 0 9.18.09.478.532.921 1.011 1.01.197.037 10.315.037 10.512 0 .479-.089.921-.532 1.011-1.01.036-.197.036-8.983 0-9.18-.064-.339-.345-.717-.66-.885-.295-.158-.036-.151-5.62-.149-4.208.001-5.15.008-5.287.038M13.04 8v4.373H2.96V3.627h10.08V8M7.519 4.762c-.555.119-1.112.5-1.429.976A2.283 2.283 0 0 0 8 9.283c.634 0 1.159-.219 1.622-.676 1.073-1.06.815-2.861-.515-3.607a2.124 2.124 0 0 0-1.12-.277 2.867 2.867 0 0 0-.468.039m.94 1.312c.407.201.637.647.562 1.088a1.032 1.032 0 0 1-1.459.775c-.587-.268-.783-1.038-.395-1.548.131-.172.257-.27.449-.351.136-.057.191-.065.411-.059.226.007.275.018.432.095M6.08 10.096a.67.67 0 0 0-.373.571c0 .242.189.51.417.59.083.029.452.036 1.876.036s1.793-.007 1.876-.036a.675.675 0 0 0 .417-.59.664.664 0 0 0-.379-.572c-.147-.062-3.692-.061-3.834.001"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoPassportCard16;
