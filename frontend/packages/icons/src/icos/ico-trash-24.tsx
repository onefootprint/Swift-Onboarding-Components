import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoTrash24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={24}
      height={24}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
      data-colored={false}
    >
      <path
        d="m6.426 20.25-.749.048a.75.75 0 0 0 .749.702v-.75Zm11.148 0V21a.75.75 0 0 0 .749-.702l-.749-.048ZM3.75 5.676a.75.75 0 1 0 0 1.5v-1.5Zm16.5 1.5a.75.75 0 0 0 0-1.5v1.5Zm-9.507 3.71a.75.75 0 1 0-1.5 0h1.5Zm-1.5 4.905a.75.75 0 1 0 1.5 0h-1.5Zm5.514-4.906a.75.75 0 0 0-1.5 0h1.5Zm-1.5 4.905a.75.75 0 1 0 1.5 0h-1.5Zm1.472-9.177a.75.75 0 1 0 1.453-.374l-1.453.374Zm-9.944-.139.892 13.824 1.497-.096-.892-13.825-1.497.097ZM6.425 21h11.15v-1.5H6.424V21Zm11.898-.702.892-13.824-1.497-.097-.892 13.825 1.497.096Zm.143-14.622H5.534v1.5h12.932v-1.5ZM3.75 7.176h1.784v-1.5H3.75v1.5Zm14.716 0h1.784v-1.5h-1.784v1.5Zm-9.223 3.71v4.905h1.5v-4.906h-1.5Zm4.014 0v4.905h1.5v-4.906h-1.5ZM12 4.5a2.82 2.82 0 0 1 2.729 2.113l1.453-.374A4.319 4.319 0 0 0 12 3v1.5ZM9.271 6.613A2.82 2.82 0 0 1 12 4.5V3a4.32 4.32 0 0 0-4.181 3.239l1.452.374Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoTrash24;
