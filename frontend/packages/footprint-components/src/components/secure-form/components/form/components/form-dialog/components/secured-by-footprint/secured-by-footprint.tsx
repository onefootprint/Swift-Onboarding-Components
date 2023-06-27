import { useTranslation } from '@onefootprint/hooks';
import { IcoFootprint16 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { Typography } from '@onefootprint/ui';
import React from 'react';

const SecuredByFootprint = () => {
  const { t } = useTranslation(
    'components.secure-form.form-dialog.secured-by-footprint',
  );

  return (
    <Container>
      <IcoFootprint16 />
      <TextContainer>
        <Typography variant="caption-1" color="secondary">
          {t('label')}
        </Typography>
      </TextContainer>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const TextContainer = styled.div`
  ${({ theme }) => css`
    margin-left: ${theme.spacing[2]};
  `}
`;

export default SecuredByFootprint;
