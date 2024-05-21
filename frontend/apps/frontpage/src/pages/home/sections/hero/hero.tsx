import { DASHBOARD_BASE_URL } from '@onefootprint/global-constants';
import {
  Box,
  Button,
  Container,
  createFontStyles,
  media,
  Stack,
  Text,
} from '@onefootprint/ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
// eslint-disable-next-line import/no-extraneous-dependencies
import ContactDialog from 'src/components/contact-dialog';
import styled, { css } from 'styled-components';

import CustomersLogos from './components/customers-logos';
import Screen from './components/screen';

const GET_FORM_URL = 'https://getform.io/f/pbygomeb';

const Hero = () => {
  const [showDialog, setShowDialog] = useState(false);

  const handleClickTrigger = () => {
    setShowDialog(true);
  };

  const { t } = useTranslation('common', { keyPrefix: 'pages.home' });
  return (
    <Background>
      <Overflow>
        <HeroContainer>
          <TextContainer>
            <Stack direction="column" gap={5}>
              <Title>{t('hero.title')}</Title>
              <Text variant="display-4" maxWidth="700px" textAlign="center">
                {t('hero.subtitle')}
              </Text>
            </Stack>
            <Stack direction="row" gap={5}>
              <Button
                variant="primary"
                size="large"
                onClick={() =>
                  window.open(
                    `${DASHBOARD_BASE_URL}/authentication/sign-up`,
                    '_blank',
                  )
                }
              >
                {t('hero.get-started')}
              </Button>
              <Button
                variant="secondary"
                size="large"
                onClick={handleClickTrigger}
              >
                {t('hero.book-a-call')}
              </Button>
            </Stack>
          </TextContainer>
          <Screen />
          <CustomersLogos />
        </HeroContainer>
      </Overflow>
      <ContactDialog
        url={GET_FORM_URL}
        open={showDialog}
        onClose={() => setShowDialog(false)}
      />
    </Background>
  );
};

const Title = styled(Box)`
  ${createFontStyles('display-2')}
  text-align: center;
  max-width: 800px;

  ${media.greaterThan('md')`
    ${createFontStyles('display-1')}
  `}
`;

const Overflow = styled.div`
  overflow: hidden;
`;

const HeroContainer = styled(Container)`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    position: relative;
    gap: ${theme.spacing[11]};
    padding: ${theme.spacing[9]} 0;
    align-items: center;

    ${media.greaterThan('md')`
      padding: ${theme.spacing[11]} 0;
    `}
  `}
`;

const TextContainer = styled(Stack)`
  ${({ theme }) => css`
    flex-direction: column;
    align-items: center;
    gap: ${theme.spacing[7]};
    z-index: 5;
  `}
`;

const Background = styled.div`
  position: relative;

  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    background: url('/home/hero/background-texture.png') no-repeat center center;
    background-size: cover;
    width: 100vw;
    height: 60%;
    z-index: -1;
    opacity: 0.5;
  }
`;

export default Hero;
