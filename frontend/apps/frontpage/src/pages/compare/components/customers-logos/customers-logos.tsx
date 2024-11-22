import { Button, Container, Stack, Text, media } from '@onefootprint/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ButtonLink from 'src/components/button-link';
import ContactDialog from 'src/components/contact-dialog';
import MarketingLink from 'src/components/marketing-link';
import styled, { css } from 'styled-components';
import Logos from './logos';

const CustomersLogos = () => {
  const [showDialog, setShowDialog] = useState(false);
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.compare.logos-section',
  });

  const handleBookDemoClick = () => {
    setShowDialog(true);
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
          <MarketingLink app="dashboard" href="authentication/sign-up" target="_blank">
            <ButtonLink variant="primary" size="large">
              {t('get-started')}
            </ButtonLink>
          </MarketingLink>
          <Button variant="secondary" size="large" onClick={handleBookDemoClick}>
            {t('book-a-demo')}
          </Button>
        </ButtonContainer>
      </StyledContainer>
      <ContactDialog open={showDialog} onClose={handleCloseDialog} />
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
