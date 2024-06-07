import { Container, Text } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import SEO from '../../components/seo';
import Consent from './sections/consent';
import HowFootprint from './sections/how-footprint';
import MoreAbout from './sections/more-about';

const IdvPrivacy = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.idv-privacy' });

  return (
    <>
      <SEO title={t('html-title')} description={t('html-description')} slug="/idv-privacy" />
      <Hero>
        <Text variant="display-2" textAlign="center">
          {t('title')}
        </Text>
        <Text variant="display-4" textAlign="center">
          {t('subtitle')}
        </Text>
      </Hero>
      <HowFootprint />
      <MoreAbout />
      <Gradient>
        <Consent />
      </Gradient>
    </>
  );
};

const Hero = styled(Container)`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing[4]};
    max-width: 640px;
  `};
`;

const Gradient = styled.div`
  ${({ theme }) => css`
    background: linear-gradient(
      180deg,
      ${theme.backgroundColor.secondary} 0%,
      ${theme.backgroundColor.primary} 100%
    );
  `};
`;

export default IdvPrivacy;
