import { Container, createFontStyles, media } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import Ctas from 'src/components/ctas';
import styled, { css } from 'styled-components';

const Hero = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.kyb.hero' });
  return (
    <Container align="center" justify="center">
      <SectionContainer>
        <TitleContainer>
          <Title>{t('title')}</Title>
          <Subtitle>{t('subtitle')}</Subtitle>
        </TitleContainer>
        <Ctas />
      </SectionContainer>
    </Container>
  );
};

const SectionContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing[8]};
    padding: ${theme.spacing[10]} 0 ${theme.spacing[12]} 0;

    ${media.greaterThan('md')`
      padding: ${theme.spacing[11]} 0 ${theme.spacing[13]} 0;
    `}
  `}
`;

const TitleContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing[4]};
  `}
`;

const Title = styled.h1`
  ${({ theme }) => css`
    ${createFontStyles('display-2')}
    color: ${theme.color.primary};
    text-align: center;
  `}
`;

const Subtitle = styled.h2`
  ${({ theme }) => css`
    ${createFontStyles('display-4')}
    color: ${theme.color.tertiary};
    text-align: center;
  `}
`;

export default Hero;
