import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoPinMarker24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M10.96 2.704a7.79 7.79 0 0 0-5.964 4.358c-.742 1.569-.931 3.313-.552 5.098.534 2.517 2.109 5.102 4.68 7.677.727.728 1.09 1.027 1.486 1.221a3.238 3.238 0 0 0 2.78 0c.413-.203.767-.5 1.598-1.341 3.688-3.735 5.293-7.523 4.608-10.877a7.756 7.756 0 0 0-6.764-6.158 9.368 9.368 0 0 0-1.872.022m1.94 1.501c2.423.317 4.529 2.202 5.142 4.604.628 2.457-.27 5.264-2.615 8.182-.525.653-.742.894-1.481 1.644-1.097 1.113-1.267 1.22-1.946 1.22s-.855-.11-1.946-1.219c-.74-.752-.957-.993-1.481-1.645-1.85-2.302-2.816-4.571-2.812-6.608.005-3.331 2.605-6.069 5.919-6.237.313-.015.846.01 1.22.059m-1.289 2.956c-.941.099-1.803.636-2.354 1.466-.668 1.006-.666 2.486.004 3.516.199.306.743.84 1.03 1.01 1.66.988 3.778.374 4.625-1.34.211-.426.289-.752.312-1.293.029-.723-.114-1.296-.459-1.839-.694-1.092-1.867-1.656-3.158-1.52m.831 1.536a1.745 1.745 0 0 1 1.272 1.423c.201 1.451-1.27 2.465-2.588 1.783-.221-.114-.568-.498-.693-.766-.544-1.161.276-2.48 1.549-2.494.132-.002.339.023.46.054"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoPinMarker24;
