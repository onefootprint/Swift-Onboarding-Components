import { Container, media } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import QuoteCard from '../../../components/quote-card';

const QuoteSection = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.industries.baas.quote',
  });
  return (
    <Background>
      <SectionContainer>
        <QuoteCard
          quote={t('quote')}
          author={t('author')}
          role={t('role')}
          company={t('company')}
          authorImage="/industries/customer-images/craig.png"
        />
      </SectionContainer>
    </Background>
  );
};

const Background = styled.div`
  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.secondary};
  `}
`;

const SectionContainer = styled(Container)`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: ${theme.spacing[9]} 0 ${theme.spacing[7]} 0;

    ${media.greaterThan('md')`
      padding: ${theme.spacing[9]} 0 ${theme.spacing[11]} 0;
    `}
  `}
`;

export default QuoteSection;
