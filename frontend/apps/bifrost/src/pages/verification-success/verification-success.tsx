import { useFootprintJs } from 'footprint-provider';
import { HeaderTitle } from 'footprint-ui';
import { useTranslation } from 'hooks';
import React from 'react';
import NavigationHeader from 'src/components/navigation-header';
import styled, { css } from 'styled-components';
import { LinkButton } from 'ui';

const VerificationSuccess = () => {
  const { t } = useTranslation('pages.verification-success');
  const footprint = useFootprintJs();

  const handleClose = () => {
    footprint.close();
  };

  return (
    <>
      <NavigationHeader button={{ variant: 'close' }} />
      <Container>
        <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
        <LinkButton onClick={handleClose}>{t('cta')}</LinkButton>
      </Container>
    </>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    row-gap: ${theme.spacing[8]}px;
    text-align: center;
  `}
`;

export default VerificationSuccess;
