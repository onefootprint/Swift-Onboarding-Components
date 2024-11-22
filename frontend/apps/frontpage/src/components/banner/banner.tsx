import { Button, Container, Stack, Text, createFontStyles, media } from '@onefootprint/ui';
import Image from 'next/image';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ButtonLink from 'src/components/button-link';
import ContactDialog from 'src/components/contact-dialog';
import MarketingLink from 'src/components/marketing-link';
import styled, { css } from 'styled-components';
import FishingPenguin from './components/fishing-penguin';

type BannerProps = {
  title: string;
  imgSrc?: string;
};

const Banner = ({ title, imgSrc }: BannerProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.home.banner' });
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      <BannerContainer>
        {imgSrc ? (
          <Illustration src={imgSrc} height={600} width={900} alt="penguin-illustration" />
        ) : (
          <FishingPenguin />
        )}
        <TextContainer>
          <Text variant="display-2" tag="h3" color="primary">
            {title}
          </Text>
          <ButtonContainer>
            <Button
              variant="primary"
              size="large"
              onClick={() => {
                setShowDialog(true);
              }}
            >
              {t('book-a-demo')}
            </Button>
            <MarketingLink app="dashboard" href="authentication/sign-up" asChild>
              <ButtonLink variant="secondary" size="large">
                {t('sign-up-for-free')}
              </ButtonLink>
            </MarketingLink>
          </ButtonContainer>
        </TextContainer>
      </BannerContainer>
      <ContactDialog open={showDialog} onClose={() => setShowDialog(false)} />
    </>
  );
};

const BannerContainer = styled(Container)`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing[9]};
    max-width: 100%;
    padding: ${theme.spacing[11]} 0 ${theme.spacing[12]} 0;
  `}
`;

const TextContainer = styled(Stack)`
  ${({ theme }) => css`
    position: relative;
    flex-direction: column;
    gap: ${theme.spacing[9]};
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

const Illustration = styled(Image)`
  object-fit: contain;
  max-height: 380px;
  height: fit-content;
  width: 100%;

  ${media.greaterThan('md')`
    max-width: 967px;
  `}
`;

export default Banner;
