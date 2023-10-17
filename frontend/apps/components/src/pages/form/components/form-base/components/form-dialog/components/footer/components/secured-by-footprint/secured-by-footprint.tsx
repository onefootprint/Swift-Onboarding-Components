import { useTranslation } from '@onefootprint/hooks';
import { IcoFootprint16 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { media, Typography } from '@onefootprint/ui';
import React from 'react';

const SecuredByFootprint = () => {
  const { t } = useTranslation(
    'pages.secure-form.form-dialog.secured-by-footprint',
  );

  return (
    <Container data-testid="secured-by-footprint">
      <IconContainer>
        <IcoFootprint16 />
      </IconContainer>
      <MobileTextContainer>
        <Typography variant="caption-1" color="secondary">
          {t('mobile-label')}
        </Typography>
      </MobileTextContainer>
      <DesktopTextContainer>
        <Typography variant="caption-1" color="secondary">
          {t('desktop-label')}
        </Typography>
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
