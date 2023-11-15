import { useTranslation } from '@onefootprint/hooks';
import styled from '@onefootprint/styled';
import React from 'react';

import SEO from '../../components/seo';
import AllData from './sections/all-data';
import AllFeatures from './sections/all-features';
import AuditTrail from './sections/audit-trail';
import DeviceInsights from './sections/device-insights';
import Hero from './sections/hero';
import PenguinBanner from './sections/penguin-banner';
import VaultProxy from './sections/vault-proxy';

const Vaulting = () => {
  const { t } = useTranslation('pages.vaulting');

  return (
    <Container>
      <SEO title={t('html-title')} slug="/vaulting" />
      <Hero />
      <AllData />
      <AuditTrail />
      <VaultProxy />
      <DeviceInsights />
      <AllFeatures />
      <PenguinBanner />
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
