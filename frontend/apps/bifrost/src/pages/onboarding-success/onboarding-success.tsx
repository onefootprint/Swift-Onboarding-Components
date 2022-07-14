import { useFootprintJs } from 'footprint-provider';
import { HeaderTitle } from 'footprint-ui';
import { useTranslation } from 'hooks';
import React from 'react';
import NavigationHeader from 'src/components/navigation-header';
import styled, { css } from 'styled-components';
import { LinkButton, Typography } from 'ui';

const OnboardingSuccess = () => {
  const { t } = useTranslation('pages.onboarding-success');
  const footprint = useFootprintJs();

  const handleClose = () => {
    footprint.close();
  };

  return (
    <>
      <NavigationHeader
        button={{
          variant: 'close',
        }}
      />
      <Container>
        <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
        <Typography variant="body-2">
          {t('body.view-on-my-footprint')}
        </Typography>
        <Typography variant="body-2">{t('body.one-click')}</Typography>
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

export default OnboardingSuccess;
