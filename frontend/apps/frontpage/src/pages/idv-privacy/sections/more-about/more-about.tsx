import styled, { css } from '@onefootprint/styled';
import { Container, media, Typography } from '@onefootprint/ui';
import Link from 'next/link';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';

const MoreAbout = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.idv-privacy.more-about',
  });
  return (
    <StyledContainer>
      <Content>
        <Typography variant="display-3" sx={{ textAlign: 'center' }}>
          {t('title')}
        </Typography>
        <Typography variant="body-2" color="secondary">
          <Trans
            i18nKey="pages.idv-privacy.more-about.description"
            components={{
              computerVisionLink: (
                <Link
                  href="https://en.wikipedia.org/wiki/Computer_vision"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              ),
              biometricIdLink: (
                <Link
                  href="https://en.wikipedia.org/wiki/Biometrics"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              ),
            }}
          />
        </Typography>
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
