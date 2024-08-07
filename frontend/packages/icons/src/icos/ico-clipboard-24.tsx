import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoClipboard24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M9.06 3.816c-.623.199-1.081.752-1.13 1.364l-.021.256-1.085.012-1.086.012-.263.13a1.598 1.598 0 0 0-.878 1.243c-.049.383-.045 11.679.004 12.023.071.488.292.846.691 1.12.41.281-.048.263 6.708.263s6.298.018 6.708-.263c.399-.274.62-.632.691-1.12.05-.348.053-11.642.003-12.03a1.63 1.63 0 0 0-.913-1.259c-.228-.107-.232-.107-1.319-.119l-1.09-.012v-.168c-.002-.541-.383-1.105-.92-1.363l-.26-.125-2.84-.008c-2.217-.006-2.875.004-3 .044m5.491 2.354.011.91H9.44v-.893c0-.492.012-.906.027-.921.015-.014 1.162-.022 2.55-.016l2.523.01.011.91M7.926 7.516l.014.597.124.153c.069.085.186.19.26.234.133.078.208.08 3.676.08s3.543-.002 3.676-.08a1.21 1.21 0 0 0 .26-.234l.124-.153.014-.597.013-.597.907.01.906.011v11.8H6.1l-.01-5.86c-.006-3.223-.002-5.882.008-5.91.015-.038.236-.05.917-.05h.898l.013.596"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoClipboard24;
