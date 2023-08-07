import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Container, Typography } from '@onefootprint/ui';
import React from 'react';

import SEO from '../../components/seo';
import Consent from './sections/consent/consent';
import HowFootprint from './sections/how-footprint/how-footprint';
import MoreAbout from './sections/more-about/more-about';

const IdvPrivacy = () => {
  const { t } = useTranslation('pages.idv-privacy');

  return (
    <>
      <SEO title={t('html-title')} slug="/idv-privacy" />
      <Hero>
        <Typography
          variant="display-2"
          sx={{
            textAlign: 'center',
          }}
        >
          {t('title')}
        </Typography>
        <Typography
          variant="display-4"
          sx={{
            textAlign: 'center',
          }}
        >
          {t('subtitle')}
        </Typography>
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
