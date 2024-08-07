import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoClock16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M7.573 1.228A6.765 6.765 0 0 0 3.204 3.2C2.017 4.387 1.345 5.872 1.222 7.58c-.09 1.241.226 2.632.847 3.732.692 1.227 1.81 2.268 3.046 2.839 2.179 1.006 4.683.816 6.658-.506 2.224-1.487 3.378-4.171 2.922-6.792A6.75 6.75 0 0 0 12.796 3.2c-1.382-1.382-3.233-2.081-5.223-1.972m1.253 1.295c2.385.347 4.28 2.246 4.655 4.665a7.113 7.113 0 0 1 0 1.624 5.561 5.561 0 0 1-3.39 4.318 5.51 5.51 0 0 1-5.902-1.116 5.52 5.52 0 0 1-1.67-3.202A5.298 5.298 0 0 1 2.473 8c0-.578.04-.906.169-1.408.578-2.241 2.572-3.92 4.884-4.112.348-.029.94-.009 1.3.043m-.957 2.041c-.249.046-.434.24-.483.51-.019.098-.026.666-.021 1.599.008 1.443.008 1.447.069 1.58.049.106.265.337 1.054 1.123 1.108 1.106 1.098 1.098 1.41 1.07a.594.594 0 0 0 .548-.548c.028-.307.022-.315-.942-1.285l-.861-.866-.008-1.36-.008-1.36-.062-.126a.621.621 0 0 0-.696-.337"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoClock16;
