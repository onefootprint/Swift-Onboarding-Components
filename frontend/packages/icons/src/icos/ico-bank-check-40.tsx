import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoBankCheck40 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      <path
        d="M4.128 6.789c-1.119.292-2.065 1.249-2.362 2.391-.086.33-.099 1.782-.099 10.82 0 11.379-.02 10.771.375 11.551.227.447.96 1.18 1.407 1.407.79.4-.302.375 16.551.375 16.853 0 15.761.025 16.551-.375.443-.225 1.179-.958 1.401-1.397.402-.791.381-.177.38-11.537-.001-11.28.014-10.809-.363-11.553-.225-.445-.808-1.056-1.273-1.336-.828-.498.529-.461-16.696-.461-14.374 0-15.463.008-15.872.115M35 20v10H5V10h30v10M7.824 11.762a1.726 1.726 0 0 0-.944.765c-.152.259-.18.383-.18.806 0 .427.027.547.185.815.209.355.529.625.898.757.347.124 2.42.124 2.767 0 .369-.132.69-.402.899-.757.157-.268.184-.388.184-.815 0-.423-.027-.547-.18-.806a1.694 1.694 0 0 0-.97-.769c-.4-.12-2.27-.118-2.659.004m11.34 3.305c-1.892.343-3.398 1.682-3.974 3.533-.225.723-.225 2.077 0 2.8a5.143 5.143 0 0 0 3.41 3.41c.723.225 2.077.225 2.8 0a5.143 5.143 0 0 0 3.41-3.41c.225-.723.225-2.077 0-2.8-.509-1.635-1.793-2.922-3.376-3.385-.601-.176-1.714-.248-2.27-.148m1.353 3.368c.63.187 1.15.895 1.15 1.567 0 .549-.361 1.157-.861 1.451-.259.153-.383.18-.806.18-.423 0-.547-.027-.806-.18-.969-.569-1.14-1.83-.355-2.615.465-.465 1.021-.599 1.678-.403m8.974 6.66a1.726 1.726 0 0 0-.944.765c-.153.26-.18.383-.18.807 0 .426.027.546.184.814.209.355.53.626.899.757.347.124 2.42.124 2.767 0 .369-.131.689-.402.898-.757.158-.268.185-.388.185-.814 0-.424-.028-.547-.18-.807a1.697 1.697 0 0 0-.971-.769c-.4-.12-2.27-.117-2.658.004"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoBankCheck40;
