import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoFootprintShield40 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={40}
      height={40}
      fill={theme.color[color]}
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
      data-colored={false}
    >
      <path d="M13.967 5.736 5.844 9.643c-2.678 1.288-2.764 1.346-2.825 1.907-.061.562.628 4.384 1.223 6.783 2.044 8.247 5.363 14.08 9.558 16.794 3.81 2.465 8.626 2.456 12.437-.023 1.422-.925 2.695-2.159 3.942-3.819 2.626-3.495 4.815-8.982 6.113-15.318.282-1.377.624-3.431.678-4.067.044-.516-.064-.816-.377-1.048-.088-.065-3.787-1.858-8.22-3.985-7.515-3.605-8.083-3.867-8.4-3.861-.305.005-.912.28-6.006 2.73M26 13.4c0 .843-.008 1.533-.017 1.533a6.44 6.44 0 0 1-.35-.125c-1.652-.619-3.42.422-3.703 2.182-.077.478.037 1.153.273 1.616.237.464.815 1.021 1.274 1.227.666.299 1.143.35 1.765.19.289-.074.577-.157.641-.186.109-.048.117.031.117 1.156V22.2h-1.618c-1.364 0-1.687.019-2.058.122-1.082.3-1.977 1.171-2.335 2.273-.126.387-.146.636-.173 2.123l-.031 1.684-2.376-.018-2.376-.017-.017-8.25-.017-8.25H26V13.4" />
    </svg>
  );
};
export default IcoFootprintShield40;
