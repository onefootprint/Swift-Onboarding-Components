import { useTranslation } from '@onefootprint/hooks';
import { media } from '@onefootprint/ui';
import React from 'react';
import styled from 'styled-components';

import SEO from '../../components/seo';
import Customizable from './components/sections/customizable';
import Hero from './components/sections/hero';
import MoreThanExpect from './components/sections/more-than-expect/more-than-expect';
import NewApproach from './components/sections/new-approach';
import PenguinBanner from './components/sections/penguin-banner/penguin-banner';
import VaultPii from './components/sections/vault-pii';
import VaultProxy from './components/sections/vault-proxy';

const Home = () => {
  const { t } = useTranslation('pages.home');
  return (
    <>
      <SEO title={t('html-title')} slug="/hero" />
      <Hero />
      <SectionSpacer />
      <NewApproach />
      <SectionSpacer />
      <Customizable />
      <SectionSpacer />
      <VaultPii />
      <VaultProxy />
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
