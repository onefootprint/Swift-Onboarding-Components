import { useTranslation } from '@onefootprint/hooks';
import { media } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import SEO from '../../components/seo';
import Accurate from './sections/accurate';
import Customizable from './sections/customizable';
import EverythingYouNeed from './sections/everything-you-need';
import Hero from './sections/hero';
import NewApproach from './sections/new-approach';
import OwnData from './sections/own-data';
import PenguinBanner from './sections/penguin-banner';
import VaultProxy from './sections/vault-proxy';

const NewHome = () => {
  const { t } = useTranslation('pages.home');
  return (
    <>
      <SEO title={t('html-title')} slug="/" />
      <Hero />
      <SectionSpacer data-type="big" />
      <NewApproach />

      <SectionSpacer />
      <Accurate />
      <SectionSpacer />
      <OwnData />
      <SectionSpacer />
      <VaultProxy />
      <SectionSpacer />
      <Customizable />
      <SectionSpacer />
      <EverythingYouNeed />
      <PenguinBanner />
    </>
  );
};

const SectionSpacer = styled.div`
  ${({ theme }) => css`
    padding: ${theme.spacing[10]} 0;

    &[data-type='big'] {
      padding: ${theme.spacing[8]} 0;
    }

    ${media.greaterThan('sm')`
      padding: ${theme.spacing[11]} 0;
    `}

    ${media.greaterThan('md')`  
      padding: ${theme.spacing[12]} 0;

        &[data-type='big'] {
          padding: ${theme.spacing[13]} 0;
        }
    `}
  `}
`;

export default NewHome;
