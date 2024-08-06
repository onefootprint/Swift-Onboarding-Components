import { IcoHeart24 } from '@onefootprint/icons';
import { Avatar } from '@onefootprint/ui';
import styled, { css } from 'styled-components';

type PartnersLogosProps = {
  tenantName: string;
  tenantLogoUrl: string;
};

const PartnersLogos = ({ tenantName, tenantLogoUrl }: PartnersLogosProps) => (
  <LogosContainer>
    <Blur blurColor="#f3ffdb">
      <Avatar name={tenantName} src={tenantLogoUrl} size="xlarge" />
    </Blur>
    <IcoHeart24 className="icon" />
    <Blur blurColor="#dfd6ff">
      <Avatar name="Footprint" src="/footprint-logos/isotype.png" size="xlarge" />
    </Blur>
  </LogosContainer>
);

const LogosContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: ${theme.spacing[7]};

    .icon {
      fill: ${theme.color.primary};
    }
  `}
`;

const Blur = styled.div<{ blurColor: string }>`
  ${({ theme, blurColor }) => css`
    display: flex;
    justify-content: center;
    width: fit-content;
    position: relative;
    background-color: ${theme.backgroundColor.primary};
    box-shadow: ${theme.elevation[2]};
    border-radius: ${theme.borderRadius.full};

    &::after {
      filter: blur(30px);
      content: '';
      display: block;
      position: absolute;
      overflow: visible;
      z-index: -1;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 200%;
      height: 200%;
      background: radial-gradient(
        50% 50% at 50% 50%,
        ${blurColor} 70%,
        transparent 100%
      );
    }
  `}
`;

export default PartnersLogos;
