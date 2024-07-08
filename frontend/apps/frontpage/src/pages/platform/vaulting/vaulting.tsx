import React from 'react';
import { useTranslation } from 'react-i18next';
import PenguinBanner from 'src/components/penguin-banner';
import styled from 'styled-components';

import SEO from '../../../components/seo';
import AllData from './sections/all-data';
import AllFeatures from './sections/all-features';
import AuditTrail from './sections/audit-trail';
import DeviceInsights from './sections/device-insights';
import Hero from './sections/hero';
import VaultProxy from './sections/vault-proxy';

const Vaulting = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.vaulting' });

  return (
    <Container>
      <SEO title={t('html-title')} description={t('html-description')} slug="/platform/vaulting" />
      <Hero />
      <AllData />
      {/* <AuditTrail />
      <VaultProxy />
      <DeviceInsights />
      <AllFeatures />
      <PenguinBanner section="vaulting" imgSrc="/vaulting/penguin-banner/vaulting.svg" /> */}
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  padding: 0;
  overflow: hidden;
`;

export default Vaulting;
