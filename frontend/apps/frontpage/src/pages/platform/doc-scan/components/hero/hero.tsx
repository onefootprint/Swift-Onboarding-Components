import { Box, Container, Stack, Text, createFontStyles, media } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import CaptureAnimation from './component/capture-animation';

const Hero = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.doc-scan.hero',
  });
  return (
    <StyledContainer paddingTop={11} paddingBottom={11}>
      <Stack direction="column" alignItems="center" justifyContent="center" gap={7} maxWidth="790px">
        <Title tag="h1">{t('title')}</Title>
        <Text variant="display-4" maxWidth="790px" color="secondary">
          {t('subtitle')}
        </Text>
      </Stack>
      <CaptureAnimation />
    </StyledContainer>
  );
};

const Title = styled(Box)`
    ${createFontStyles('display-2')}

    ${media.greaterThan('md')`
      ${createFontStyles('display-1')}
    `}
`;

const StyledContainer = styled(Container)`
  ${({ theme }) => css`
    padding-top: ${theme.spacing[11]};
    gap: ${theme.spacing[10]};
    text-align: center;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  `}
`;

export default Hero;
