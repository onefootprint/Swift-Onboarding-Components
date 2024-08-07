import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoImages24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M5.494 4.444c-.355.103-.772.459-.946.806a1.898 1.898 0 0 0-.146.47c-.057.358-.057 12.202 0 12.56.056.353.208.639.475.893.268.255.496.369.843.425.359.057 12.201.057 12.56 0 .347-.056.575-.17.843-.425.267-.254.419-.54.475-.893.057-.358.057-12.202 0-12.56a1.881 1.881 0 0 0-.144-.466c-.13-.259-.449-.572-.734-.72l-.22-.114-6.44-.007c-3.823-.004-6.491.009-6.566.031M18.11 9.226l.01 3.326-.33.287c-1.043.908-1.99 1.281-3.25 1.28-.984-.001-1.846-.32-2.779-1.031-.164-.125-.624-.545-1.021-.931-.617-.601-.766-.726-1.021-.851-.747-.367-1.592-.345-2.286.059-.103.06-.49.337-.86.615l-.673.505-.01-3.252c-.006-1.789-.002-3.276.008-3.303.016-.04 1.259-.048 6.111-.04l6.091.01.01 3.326m-3.95-2.284c-1.121.241-1.966 1.385-1.863 2.522.057.632.26 1.063.718 1.521.517.517.987.712 1.705.71.538-.002.938-.124 1.347-.411.66-.464 1.001-1.074 1.041-1.864.038-.749-.162-1.274-.688-1.802-.629-.633-1.394-.862-2.26-.676m.952 1.534c.176.091.333.252.428.44.107.214.072.662-.071.877a.842.842 0 0 1-.661.396c-.297.027-.49-.035-.699-.224-.376-.339-.412-.845-.09-1.268.216-.283.759-.392 1.093-.221m-6.123 4.145c.085.036.406.315.769.671.686.671 1.079 1.001 1.622 1.359 1.375.905 2.912 1.186 4.545.83.639-.139 1.46-.479 1.935-.799.088-.06.183-.122.21-.138.04-.023.05.343.05 1.774v1.802H5.88v-3.75l1.098-.824c.605-.453 1.167-.861 1.25-.905.184-.099.549-.108.761-.02"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoImages24;
