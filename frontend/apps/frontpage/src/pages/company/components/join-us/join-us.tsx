import { IcoArrowRightSmall16 } from '@onefootprint/icons';
import { LinkButton, Text, media } from '@onefootprint/ui';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

const JoinUs = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.company.join-us',
  });
  return (
    <Container id="join-us">
      <ImageContainer>
        <Image src="/company/penguin.png" height={800} width={800} alt={t('title')} />
      </ImageContainer>
      <TextContainer>
        <Text variant="heading-1" color="primary" tag="h2">
          {t('title')}
        </Text>
        <ParagraphsContainer>
          <Text variant="body-1" color="secondary" tag="p">
            {t('description')}
          </Text>
          <CtaContainer>
            <Text variant="body-1" color="secondary" tag="p">
              {t('pre-cta')}
            </Text>
            <LinkButton variant="label-1" href={`mailto:${t('email-address')}`} iconComponent={IcoArrowRightSmall16}>
              {t('cta')}
            </LinkButton>
          </CtaContainer>
        </ParagraphsContainer>
      </TextContainer>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: stretch;
    padding: ${theme.spacing[11]} 0 ${theme.spacing[12]} 0;
    gap: ${theme.spacing[8]};
    max-width: 880px;

    ${media.greaterThan('md')`
        flex-direction: row;
    `}
  `}
`;

const ParagraphsContainer = styled.div`
  ${({ theme }) => css`
    margin-top: ${theme.spacing[5]};
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing[4]};
  `}
`;

const ImageContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    justify-content: stretch;
    width: 100%;
    max-height: 380px;
    border-radius: ${theme.borderRadius.default};
    overflow: hidden;
    flex-shrink: 0;

    img {
      object-fit: cover;
      width: 100%;
      height: 100%;
    }

    ${media.greaterThan('md')`
        max-width: 320px;
    `}
  `}
`;

const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const CtaContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    gap: ${theme.spacing[3]};
  `}
`;
export default JoinUs;
