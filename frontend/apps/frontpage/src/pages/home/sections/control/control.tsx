import { Container, media, Stack } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import SectionTitle from '../../../../components/desktop-share-post/section-title';
import IllustrationGrid from './illustration-grid';

const Control = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.home.control',
  });

  return (
    <SectionContainer>
      <Container alignItems="center" justifyContent="center">
        <SectionTitle title={t('title')} subtitle={t('subtitle')} />
      </Container>
      <IllustrationGrid />
    </SectionContainer>
  );
};

const SectionContainer = styled(Stack)`
  ${({ theme }) => css`
    gap: ${theme.spacing[9]};
    flex-direction: column;
    align-items: center;
    overflow: hidden;
    padding: ${theme.spacing[9]} 0;

    ${media.greaterThan('md')`
      padding: ${theme.spacing[11]} 0;
    `}
  `}
`;

export default Control;
