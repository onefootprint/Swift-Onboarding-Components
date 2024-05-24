import { DASHBOARD_BASE_URL } from '@onefootprint/global-constants';
import {
  Button,
  Container,
  createFontStyles,
  media,
  Stack,
} from '@onefootprint/ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
// eslint-disable-next-line import/no-extraneous-dependencies
import ContactDialog from 'src/components/contact-dialog';
import styled, { css } from 'styled-components';

import FishingPenguin from './components/fishing-penguin';

type BannerProps = {
  title: string;
};

const GET_FORM_URL = 'https://getform.io/f/pbygomeb';

const Banner = ({ title }: BannerProps) => {
  const [showDialog, setShowDialog] = useState(false);
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.home.banner',
  });
  return (
    <>
      <BannerContainer>
        <FishingPenguin />
        <TextContainer>
          {title}
          <ButtonContainer>
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
              {t('get-started')}
            </Button>
            <Button
              variant="secondary"
              size="large"
              onClick={() => setShowDialog(true)}
            >
              {t('book-a-demo')}
            </Button>
          </ButtonContainer>
        </TextContainer>
      </BannerContainer>
      <ContactDialog
        url={GET_FORM_URL}
        open={showDialog}
        onClose={() => setShowDialog(false)}
      />
    </>
  );
};

const BannerContainer = styled(Container)`
  ${({ theme }) => css`
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing[10]};
    max-width: 100%;
  `}
`;

const TextContainer = styled(Stack)`
  ${({ theme }) => css`
    ${createFontStyles('display-3')}
    position: relative;
    flex-direction: column;
    gap: ${theme.spacing[8]};
    text-align: center;
    max-width: 600px;

    ${media.greaterThan('md')`
      ${createFontStyles('display-2')}
      align-items: center;
      justify-content: center;
      align-items: center;
      justify-content: center;
      text-align: center;
    `}
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

export default Banner;
