import { Box } from '@onefootprint/ui';
import styled, { css } from 'styled-components';

const VaultData = styled(Box)`
  ${({ theme }) => css`
    width: 100%;
    height: 100%;
    position: relative;
    isolation: isolate;
    background-image: url('/industries/featured-cards/vault-data/background.jpg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;

    &::before {
      content: '';
      position: absolute;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        to bottom,
        transparent 0%,
        transparent 80%,
        ${theme.backgroundColor.primary} 95%
      );

      pointer-events: none;
    }
  `}
`;

export default VaultData;
