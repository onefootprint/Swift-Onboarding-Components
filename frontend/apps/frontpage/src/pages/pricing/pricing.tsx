import { useTranslation } from '@onefootprint/hooks';
import { media, Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import SEO from '../../components/seo';
import Faq from './components/faq';
import AddOns from './components/plan-tables/add-ons/add-ons';
import CorePlan from './components/plan-tables/core-plan/core-plan';

const Pricing = () => {
  const { t } = useTranslation('pages.pricing');
  const { t: faq } = useTranslation('pages.pricing.faq.questions');

  return (
    <>
      <SEO title={t('html-title')} slug="/pricing" />
      <Container>
        <HeroContainer>
          <Typography
            as="h1"
            sx={{ maxWidth: '700px', marginBottom: 5 }}
            variant="display-2"
          >
            {t('hero.title')}
          </Typography>
        </HeroContainer>
        <PlansContainer>
          <CorePlan />
          <AddOns />
        </PlansContainer>
        <Faq
          title={t('faq.title')}
          items={[
            {
              id: 'credits',
              content: faq('credits.content'),
              title: faq('credits.title'),
            },
            {
              id: 'one-click-kyc-difference',
              content: faq('one-click-kyc-difference.content'),
              title: faq('one-click-kyc-difference.title'),
            },
            {
              id: 'one-click-charge',
              content: faq('one-click-charge.content'),
              title: faq('one-click-charge.title'),
            },
            {
              id: 'how-to-recoup',
              content: faq('how-to-recoup.content'),
              title: faq('how-to-recoup.title'),
            },
            {
              id: 'competitor-pricing',
              content: faq('competitor-pricing.content'),
              title: faq('competitor-pricing.title'),
            },
            {
              id: 'step-up-pricing',
              content: faq('step-up-pricing.content'),
              title: faq('step-up-pricing.title'),
            },
            {
              id: 'failure-charge',
              content: faq('failure-charge.content'),
              title: faq('failure-charge.title'),
            },
            {
              id: 'business-model',
              content: faq('business-model.content'),
              title: faq('business-model.title'),
            },
            {
              id: 'disclose-pricing',
              content: faq('disclose-pricing.content'),
              title: faq('disclose-pricing.title'),
            },
            {
              id: 'drivers-license-scans',
              content: faq('drivers-license-scans.content'),
              title: faq('drivers-license-scans.title'),
            },
          ]}
        />
      </Container>
      <Background />
    </>
  );
};

const Background = styled.span`
  position: absolute;
  z-index: -1;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  overflow: hidden;
  background-size: cover;
  background: radial-gradient(at 70% 38%, #e8faff 0%, transparent 30%),
    radial-gradient(at 30% 20%, #ecfff4 0%, transparent 10%),
    radial-gradient(at 30% 40%, #ffedfe 0%, transparent 32%);
`;

const Container = styled.div`
  ${({ theme }) => css`
    margin: 0 auto;
    max-width: 992px;
    padding: ${theme.spacing[5]};
    z-index: 1;

    ${media.greaterThan('sm')`
      padding: 0;
    `};
  `}
`;

const HeroContainer = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    flex-direction: column;
    margin-bottom: ${theme.spacing[8]};
    text-align: center;

    ${media.greaterThan('md')`
      margin-bottom: ${theme.spacing[10]};
    `}
  `}
`;

const PlansContainer = styled.div`
  ${({ theme }) => css`
    max-width: 596px;
    margin: auto;
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};

    ${media.greaterThan('sm')`
      gap: ${theme.spacing[8]};
    `}
  `}
`;

export default Pricing;
