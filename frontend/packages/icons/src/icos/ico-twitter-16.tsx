import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoTwitter16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      <path d="M10.467 2.028A3.098 3.098 0 0 0 7.906 4.28a3.395 3.395 0 0 0-.068 1.169c.018.12.031.229.03.243-.002.032-.195.023-.615-.028A8.848 8.848 0 0 1 2.8 3.79c-.288-.231-.94-.86-1.12-1.08a.999.999 0 0 0-.136-.149c-.022-.001-.22.433-.273.599a3.005 3.005 0 0 0 .724 3.02c.113.114.264.249.335.3l.13.093-.097.009c-.22.018-.801-.134-1.12-.294l-.157-.079.019.222c.066.786.349 1.403.892 1.946.147.146.356.321.49.408.244.159.632.335.86.39a.648.648 0 0 1 .155.052c.076.068-.974.13-1.23.073-.083-.018-.088-.015-.071.04.044.145.23.509.359.702.078.116.245.314.371.439.505.501 1.121.795 1.862.887l.26.033-.333.222a7.322 7.322 0 0 1-1.34.683c-.762.279-1.741.422-2.5.366a3.267 3.267 0 0 0-.342-.017c-.041.035.985.554 1.464.741 1.543.604 3.299.759 4.995.442a8.484 8.484 0 0 0 3.701-1.681c.313-.249 1.026-.952 1.266-1.25a9.077 9.077 0 0 0 1.943-4.486c.023-.165.049-.556.058-.868l.016-.568.176-.137c.315-.248.627-.542.859-.811.276-.319.463-.567.444-.586-.008-.008-.049.003-.091.024-.233.12-1.042.339-1.502.406l-.12.018.16-.113a3.049 3.049 0 0 0 1.16-1.522c0-.014-.133.042-.294.123-.472.237-.88.388-1.37.507l-.264.065-.155-.144a3.211 3.211 0 0 0-1.367-.724 3.808 3.808 0 0 0-1.15-.063" />
    </svg>
  );
};
export default IcoTwitter16;
