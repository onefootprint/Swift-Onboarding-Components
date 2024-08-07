import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoDatabaseCheck24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      <path d="m10.42 3.584-.62.058c-2.003.186-3.687.695-4.597 1.391a2.262 2.262 0 0 0-.731.918l-.092.229L4.368 12c-.008 4.137.002 5.895.033 6.08.138.806.857 1.45 2.159 1.933 1.472.546 3.789.848 5.89.768l.79-.03-.194-.225a5.476 5.476 0 0 1-.687-.975l-.134-.26-1.003-.023c-1.295-.03-2.243-.145-3.242-.392-.86-.213-1.645-.551-1.946-.837l-.154-.147v-2.214l.122.063c.222.115.812.327 1.258.452.975.275 2.161.456 3.44.525 1.131.062 1.052.07 1.08-.108.095-.602.176-.928.321-1.3.026-.065-.017-.07-.567-.07-2.32-.001-4.78-.556-5.501-1.242l-.153-.146v-.89c0-.698.011-.886.05-.868 1.17.528 2.623.854 4.39.986a26.35 26.35 0 0 0 2.92-.004l.62-.044.6-.297c.682-.337 1.124-.467 1.831-.538.247-.025.578-.034.737-.02.212.019.325.01.43-.033.134-.057.142-.056.142.017 0 .052.036.086.11.102a5.8 5.8 0 0 1 1.048.332l.364.157-.011-3.326L19.1 6.1l-.124-.261c-.516-1.089-2.271-1.847-5.056-2.182-.51-.062-3.068-.115-3.5-.073m2.44 1.496c1.724.108 3.236.433 4.095.88.367.191.645.415.645.52 0 .195-.679.592-1.444.843-2.481.814-6.562.786-8.995-.064-.612-.214-1.097-.484-1.228-.685-.056-.085-.056-.103 0-.188.033-.052.166-.164.294-.249 1.166-.774 3.983-1.223 6.633-1.057M7.098 8.819c.839.254 1.901.439 3.102.541.642.054 2.473.055 3.12 0 1.601-.134 3.084-.461 4.05-.893l.23-.103v1.914l-.205.163c-1.005.793-3.891 1.309-6.528 1.165a16.906 16.906 0 0 1-2.415-.283c-1.064-.218-2.026-.59-2.388-.924l-.184-.169V8.365l.37.155c.204.085.585.219.848.299M18.34 15.22c-.189.066-.457.34-.871.892-.378.502-.608.835-.843 1.217l-.19.308-.244-.283c-.271-.315-.414-.394-.713-.394a.64.64 0 0 0-.526.226.754.754 0 0 0-.114.846c.098.182 1.22 1.512 1.369 1.622.166.121.505.136.722.031.211-.102.299-.215.469-.602.289-.658.854-1.559 1.41-2.245.469-.58.503-.63.531-.798.059-.347-.188-.743-.521-.835a.63.63 0 0 0-.479.015" />
    </svg>
  );
};
export default IcoDatabaseCheck24;
