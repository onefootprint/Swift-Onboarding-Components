import { useTranslation } from 'hooks';
import React from 'react';
import styled, { css } from 'styled-components';
import { Box, Button, Divider, Typography } from 'ui';

const OnboardingConfigurations = () => {
  const { t } = useTranslation('pages.developers.onboarding-configurations');

  return (
    <>
      <Header>
        <Box>
          <Typography variant="label-1" as="h3" sx={{ marginBottom: 2 }}>
            {t('header.title')}
          </Typography>
          <Typography variant="body-3">{t('header.subtitle')}</Typography>
        </Box>
        <Button onClick={() => {}} variant="secondary" size="small">
          {t('header.cta')}
        </Button>
      </Header>
      <StyledDivider />
      <Typography color="secondary" variant="body-2">
        {t('list.no-results')}
      </Typography>
    </>
  );
};

const Header = styled.header`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

const StyledDivider = styled(Divider)`
  ${({ theme }) => css`
    margin: ${theme.spacing[7]}px 0;
  `}
`;

export default OnboardingConfigurations;
