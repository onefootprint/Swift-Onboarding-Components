import { useTranslation } from '@onefootprint/hooks';
import styled from '@onefootprint/styled';
import { media } from '@onefootprint/ui';
import React from 'react';

import SEO from '../../components/seo';
import CustomersLogos from './components/customers-logos';
import Customizable from './components/sections/customizable';
import Hero from './components/sections/hero';
import MoreThanExpect from './components/sections/more-than-expect';
import NewApproach from './components/sections/new-approach';
import PenguinBanner from './components/sections/penguin-banner';
import VaultPii from './components/sections/vault-pii';
import VaultProxy from './components/sections/vault-proxy';

const Home = () => {
  const { t } = useTranslation('pages.home');

  return (
    <>
      <SEO title={t('html-title')} slug="/hero" />
      <Hero />
      <SectionSpacer />
      <CustomersLogos />
      <SectionSpacer />
      <NewApproach />
      <SectionSpacer />
      <Customizable />
      <SectionSpacer />
      <SectionSpacer />
      <div id="dark-start" />
      <VaultPii />
      <VaultProxy />
      <div id="dark-end" />
      <SectionSpacer />
      <MoreThanExpect />
      <SectionSpacer />
      <PenguinBanner />
    </>
  );
};

const SectionSpacer = styled.div`
  height: 80px;

  ${media.greaterThan('lg')`
    height: 156px;
  `}
`;

export default Home;
