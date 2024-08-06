import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoWand40 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={40}
      height={40}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
      data-colored={false}
    >
      <g clipPath="url(#prefix__a)" fill={theme.color[color]}>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M28.476 5a3.334 3.334 0 0 1 4.714 0L35 6.81a3.333 3.333 0 0 1 0 4.714L11.523 35a3.333 3.333 0 0 1-4.714 0L5 33.19a3.333 3.333 0 0 1 0-4.714L28.477 5Zm-1.536 6.25 1.81 1.81 3.893-3.893-1.81-1.81-3.893 3.893Zm-.547 4.167-1.81-1.81L7.357 30.833l1.81 1.81 17.226-17.226Z"
        />
        <path d="M16.418 3.458a.834.834 0 0 0 .373-.373l.797-1.594a.833.833 0 0 1 1.49 0l.798 1.594c.08.161.211.292.372.373l1.595.797a.833.833 0 0 1 0 1.49l-1.595.797a.834.834 0 0 0-.372.373l-.797 1.594a.833.833 0 0 1-1.491 0l-.797-1.594a.834.834 0 0 0-.373-.373l-1.594-.797a.833.833 0 0 1 0-1.49l1.594-.797ZM31.418 21.79a.833.833 0 0 0 .373-.372l.797-1.594a.834.834 0 0 1 1.49 0l.798 1.594c.08.162.211.292.372.373l1.594.797a.833.833 0 0 1 0 1.49l-1.594.798a.833.833 0 0 0-.372.372l-.797 1.595a.833.833 0 0 1-1.491 0l-.797-1.595a.833.833 0 0 0-.373-.372l-1.594-.797a.833.833 0 0 1 0-1.491l1.594-.797ZM8.085 11.79a.833.833 0 0 0 .372-.372l.797-1.594a.833.833 0 0 1 1.491 0l.797 1.594c.08.162.212.292.373.373l1.594.797a.833.833 0 0 1 0 1.49l-1.594.798a.833.833 0 0 0-.373.373l-.797 1.594a.833.833 0 0 1-1.49 0l-.798-1.595a.833.833 0 0 0-.372-.372l-1.595-.797a.833.833 0 0 1 0-1.491l1.595-.797Z" />
      </g>
      <defs>
        <clipPath id="prefix__a">
          <path fill="#fff" d="M0 0h40v40H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};
export default IcoWand40;
