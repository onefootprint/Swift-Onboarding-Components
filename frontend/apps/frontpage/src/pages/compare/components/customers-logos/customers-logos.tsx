import { DASHBOARD_BASE_URL } from '@onefootprint/global-constants';
import { Button, Container, Stack, Text, media } from '@onefootprint/ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ContactDialog from 'src/components/contact-dialog';
import { LINTRK_CONVERSION_ID } from 'src/config/constants';
import styled, { css } from 'styled-components';
import Logos from './logos';

const GET_FORM_URL = 'https://getform.io/f/pbygomeb';

const CustomersLogos = () => {
  const [showDialog, setShowDialog] = useState(false);
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.compare.logos-section',
  });

  const handleBookDemoClick = () => {
    window.lintrk('track', { conversion_id: LINTRK_CONVERSION_ID });
    setShowDialog(true);
  };

  const handleGetStartedClick = () => {
    window.lintrk('track', { conversion_id: LINTRK_CONVERSION_ID });
    window.open(`${DASHBOARD_BASE_URL}/authentication/sign-up`, '_blank');
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
  };

  return (
    <>
      <StyledContainer direction="column" gap={9} align="center" paddingBottom={11} marginTop={9}>
        <Stack direction="column" gap={6} align="center" maxWidth="720px" textAlign="center">
          <Text tag="h4" variant="display-3">
            {t('title')}
          </Text>
        </Stack>
        <Logos />
        <ButtonContainer>
          <Button variant="primary" size="large" onClick={handleGetStartedClick}>
            {t('get-started')}
          </Button>
          <Button variant="secondary" size="large" onClick={handleBookDemoClick}>
            {t('book-a-demo')}
          </Button>
        </ButtonContainer>
      </StyledContainer>
      <ContactDialog url={GET_FORM_URL} open={showDialog} onClose={handleCloseDialog} />
    </>
  );
};

const StyledContainer = styled(Container)`
  ${({ theme }) => css`
    position: relative; 

    &:before {
      content: '';
      position: absolute;
      top: -${theme.spacing[10]};
      left: 0;
      width: 100%;
      height: 1px;
      background: radial-gradient(circle, ${theme.borderColor.tertiary} 0%, transparent 100%);
    }
  `}
`;

const ButtonContainer = styled(Stack)`
  ${({ theme }) => css`
    flex-direction: column;
    gap: ${theme.spacing[4]};
    width: 100%;

    ${media.greaterThan('md')`     
      flex-direction: row;
      align-items: center;
      justify-content: center;
      gap: ${theme.spacing[3]};
    `}
  `}
`;

export default CustomersLogos;
