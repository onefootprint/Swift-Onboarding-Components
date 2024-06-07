import { IcoFootprint16 } from '@onefootprint/icons';
import { Text, media } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

const SecuredByFootprint = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.secure-form.form-dialog.secured-by-footprint',
  });

  return (
    <Container data-testid="secured-by-footprint">
      <IconContainer>
        <IcoFootprint16 />
      </IconContainer>
      <MobileTextContainer>
        <Text variant="caption-1" color="secondary">
          {t('mobile-label')}
        </Text>
      </MobileTextContainer>
      <DesktopTextContainer>
        <Text variant="caption-1" color="secondary">
          {t('desktop-label')}
        </Text>
      </DesktopTextContainer>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 16px;
    margin-right: ${theme.spacing[3]};
  `}
`;

const MobileTextContainer = styled.div`
  ${({ theme }) => css`
    margin-left: ${theme.spacing[2]};
    display: none;

    ${media.lessThan('sm')`
      display: flex;
    `}
  `}
`;

const DesktopTextContainer = styled.div`
  ${({ theme }) => css`
    margin-left: ${theme.spacing[2]};

    ${media.lessThan('sm')`
      display: none;
    `}
  `}
`;

const IconContainer = styled.div`
  min-width: 16px;
`;

export default SecuredByFootprint;
