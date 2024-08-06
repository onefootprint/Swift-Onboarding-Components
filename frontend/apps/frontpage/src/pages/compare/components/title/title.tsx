import { Container, Text, createFontStyles, media } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import Ctas from 'src/components/ctas';
import styled, { css, keyframes } from 'styled-components';

const Title = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.compare' });

  return (
    <StyledContainer align="center" justify="center" paddingTop={11} paddingBottom={10}>
      <TitleContainer>
        {t('title.first')}
        <GradientText>{t('title.differently')}</GradientText>
        <br />
        <span>{t('title.fromTheStart')}</span>.
      </TitleContainer>
      <Text variant="display-4" color="tertiary" maxWidth="600px" textAlign="center">
        {t('subtitle')}
      </Text>
      <Ctas />
    </StyledContainer>
  );
};

const TitleContainer = styled.h1`
  ${createFontStyles('display-2')}
  width: 100%;
  text-align: center;

  ${media.greaterThan('md')`
    ${createFontStyles('display-1')}
  `}
`;

const gradientAnimation = keyframes`
  0% {
    background-position: 0% 50%;
  }
  25% {
    background-position: 100% 75%;
  }
  50% {
    background-position: 200% 25%;
  }
  75% {
    background-position: 400% 75%;
  }
  100% {
    background-position: 600% 50%;
  }
`;

const StyledContainer = styled(Container)`
  ${({ theme }) => css`
    gap: ${theme.spacing[5]};
  `}
`;

const GradientText = styled.span`
  ${({ theme }) => css`
    background: linear-gradient(270deg, ${theme.color.accent}, #b19cd9, #ffb3ba, #ffc9ba, ${theme.color.accent});
    background-size: 200% 200%;
    animation: ${gradientAnimation} 20s ease-in-out infinite;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-left: ${theme.spacing[3]};
    margin-right: ${theme.spacing[3]};
  `}
`;

export default Title;
