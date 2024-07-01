import {
  IcoDatabase24,
  IcoGridMasonry24,
  IcoIdCard24,
  // IcoKey24,
  IcoLayer0124,
  IcoStore24,
} from '@onefootprint/icons';
import { media } from '@onefootprint/ui';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import { useHover } from 'usehooks-ts';

// import AuthIllustration from './illustrations/auth-illustration';
import KybIllustration from './illustrations/kyb-illustration';
import KycIllustration from './illustrations/kyc-illustration';
import OtherComponentsIllustration from './illustrations/other-components-illustration';
import VaultProxyIllustration from './illustrations/vault-proxy-illustration';
import VaultingIllustration from './illustrations/vaulting-illustration';
import SectionCard from './section-card/section-card';

const SectionCards = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.home.quickstart',
  });
  const kybHover = useRef(null);
  const kycHover = useRef(null);
  const vaultingHover = useRef(null);
  const vaultProxyHover = useRef(null);
  const otherComponentsHover = useRef(null);
  // const authCardHover = useRef(null);

  const isKybHover = useHover(kybHover);
  const isKycHover = useHover(kycHover);
  const isVaultingHover = useHover(vaultingHover);
  const isVaultProxyHover = useHover(vaultProxyHover);
  const isOtherComponentsHover = useHover(otherComponentsHover);
  // const isAuthCardHover = useHover(authCardHover);

  return (
    <Grid>
      <div ref={kycHover}>
        <SectionCard
          title={t('kyc.title')}
          subtitle={t('kyc.description')}
          href="/kyc/getting-started"
          icon={IcoIdCard24}
          gridArea="kyc"
        >
          <KycIllustration isHovered={isKycHover} />
        </SectionCard>
      </div>
      <div ref={kybHover}>
        <SectionCard
          title={t('kyb.title')}
          subtitle={t('kyb.description')}
          href="/kyb/getting-started"
          icon={IcoStore24}
          gridArea="kyb"
        >
          <KybIllustration isHovered={isKybHover} />
        </SectionCard>
      </div>
      <div ref={vaultingHover}>
        <SectionCard
          title={t('vaulting.title')}
          subtitle={t('vaulting.description')}
          href="https://docs.onefootprint.com/vault/fields"
          icon={IcoDatabase24}
          gridArea="vaulting"
        >
          <VaultingIllustration isHovered={isVaultingHover} />
        </SectionCard>
      </div>
      <div ref={vaultProxyHover}>
        <SectionCard
          title={t('vault-proxy.title')}
          subtitle={t('vault-proxy.description')}
          href="/vault/proxy"
          icon={IcoLayer0124}
          gridArea="vault-proxy"
        >
          <VaultProxyIllustration isHovered={isVaultProxyHover} />
        </SectionCard>
      </div>
      <div ref={otherComponentsHover}>
        <SectionCard
          title={t('embedded-components.title')}
          subtitle={t('embedded-components.description')}
          href="/embedded-components/getting-started"
          icon={IcoGridMasonry24}
          gridArea="components"
        >
          <OtherComponentsIllustration isHovered={isOtherComponentsHover} />
        </SectionCard>
      </div>
      {/* <div ref={authCardHover}>
        <SectionCard
          title={t('auth.title')}
          subtitle={t('auth.description')}
          // add href when auth is ready
          href="/"
          icon={IcoKey24}
          gridArea="auth"
        >
          <AuthIllustration isHovered={isAuthCardHover} />
        </SectionCard>
      </div> */}
    </Grid>
  );
};

const Grid = styled.div`
  ${({ theme }) => css`
    width: 100%;
    display: grid;
    grid-template-columns: 1fr;
    grid-gap: ${theme.spacing[5]};
    grid-template-rows: repeat(2, 1fr);
    grid-template-areas:
      'kyc' 'kyb' 'vaulting' 'vault-proxy' 'components',
      'auth';

    ${media.greaterThan('sm')`
         grid-template-columns: repeat(2, 1fr);
         grid-template-areas:
      'kyc kyb'
      'vaulting vault-proxy'
      'components auth';
      `}
  `}
`;

export default SectionCards;
