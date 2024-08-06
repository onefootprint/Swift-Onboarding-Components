import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoWand16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={16}
      height={16}
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
          d="M11.39 2c.521-.52 1.365-.52 1.886 0l.724.724c.52.52.52 1.365 0 1.885L4.61 14c-.521.52-1.366.52-1.886 0L2 13.276a1.333 1.333 0 0 1 0-1.886L11.39 2Zm-.614 2.5.724.724 1.557-1.557-.724-.724L10.776 4.5Zm-.219 1.667-.724-.724-6.89 6.89.724.724 6.89-6.89Z"
        />
        <path d="M6.567 1.383a.333.333 0 0 0 .15-.149l.318-.638a.333.333 0 0 1 .596 0l.32.638a.333.333 0 0 0 .148.149l.638.319a.333.333 0 0 1 0 .596l-.638.319a.333.333 0 0 0-.149.149l-.319.638a.333.333 0 0 1-.596 0l-.319-.638a.333.333 0 0 0-.149-.149l-.637-.319a.333.333 0 0 1 0-.596l.637-.319ZM12.567 8.716a.334.334 0 0 0 .15-.149l.318-.637a.333.333 0 0 1 .596 0l.32.637a.334.334 0 0 0 .148.15l.638.318a.333.333 0 0 1 0 .596l-.638.32a.334.334 0 0 0-.149.148l-.319.638a.333.333 0 0 1-.596 0l-.319-.638a.334.334 0 0 0-.149-.149l-.637-.319a.333.333 0 0 1 0-.596l.637-.319ZM3.234 4.716a.333.333 0 0 0 .149-.149l.319-.637a.333.333 0 0 1 .596 0l.319.637a.333.333 0 0 0 .149.15l.638.318a.333.333 0 0 1 0 .596l-.638.32a.333.333 0 0 0-.15.148l-.318.638a.333.333 0 0 1-.596 0l-.32-.638a.333.333 0 0 0-.148-.149l-.638-.319a.333.333 0 0 1 0-.596l.638-.319Z" />
      </g>
      <defs>
        <clipPath id="prefix__a">
          <path fill="#fff" d="M0 0h16v16H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};
export default IcoWand16;
