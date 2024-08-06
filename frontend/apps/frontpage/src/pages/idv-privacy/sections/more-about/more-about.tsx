import { Container, Text, media } from '@onefootprint/ui';
import Link from 'next/link';
import { Trans, useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

const MoreAbout = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.idv-privacy.more-about',
  });
  return (
    <StyledContainer>
      <Content>
        <Text variant="display-3" textAlign="center">
          {t('title')}
        </Text>
        <Text variant="body-2" color="secondary">
          <Trans
            i18nKey="pages.idv-privacy.more-about.description"
            components={{
              computerVisionLink: (
                <Link href="https://en.wikipedia.org/wiki/Computer_vision" target="_blank" rel="noopener noreferrer" />
              ),
              biometricIdLink: (
                <Link href="https://en.wikipedia.org/wiki/Biometrics" target="_blank" rel="noopener noreferrer" />
              ),
            }}
          />
        </Text>
      </Content>
    </StyledContainer>
  );
};

const StyledContainer = styled(Container)`
  ${({ theme }) => css`
    padding: ${theme.spacing[6]} 0 ${theme.spacing[10]} 0;

    ${media.greaterThan('md')`
      padding: ${theme.spacing[12]} 0;
    `}
  `}
`;

const Content = styled.div`
  ${({ theme }) => css`
    max-width: 620px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing[8]};
    white-space: break-spaces;
    margin: auto;

    ${media.greaterThan('md')`
      padding: ${theme.spacing[8]};
    `}
  `}
`;

export default MoreAbout;
