import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoLinkedin24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      <path d="M5.13 4.623a1.177 1.177 0 0 0-.546.575L4.5 5.38v13.24l.084.182c.123.266.311.46.569.586l.227.112h13.24l.227-.112a1.18 1.18 0 0 0 .569-.586l.084-.182V5.38l-.084-.182a1.177 1.177 0 0 0-.546-.575l-.206-.103H5.336l-.206.103m3.379 2.098c.447.221.691.633.691 1.169 0 1.115-1.325 1.696-2.171.953a1.544 1.544 0 0 1-.278-.396c-.117-.236-.131-.301-.127-.586.004-.366.086-.595.3-.84.401-.456 1.027-.574 1.585-.3m6.907 3.798c.68.174 1.217.605 1.502 1.207.275.58.285.69.311 3.244l.023 2.27h-2.248l-.013-2.05c-.014-2.234-.01-2.191-.252-2.558-.414-.627-1.482-.421-1.866.36-.093.188-.093.188-.104 2.218l-.011 2.03H10.52v-6.72h2.16v.91l.31-.309a2.2 2.2 0 0 1 1.054-.618c.325-.087.999-.079 1.372.016M9 13.88v3.36H6.76v-6.72H9v3.36" />
    </svg>
  );
};
export default IcoLinkedin24;
