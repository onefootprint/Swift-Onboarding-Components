import { useTranslation } from '@onefootprint/hooks';
import { IcoFileText24, IcoWarning16 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { Divider, Typography } from '@onefootprint/ui';
import React from 'react';

import UploadFiles from './components/upload-files';

type UploadComplianceLetterProps = {
  hasError?: boolean;
  onChange: (files: File[]) => void;
};

const UploadComplianceLetter = ({
  hasError,
  onChange,
}: UploadComplianceLetterProps) => {
  const { t } = useTranslation('pages.declarations.doc-upload');

  return (
    <>
      <Divider />
      <Container>
        <UploadFilesLabel>
          <IcoFileText24 />
          <Typography variant="label-3" color="secondary">
            {t('label')}
          </Typography>
        </UploadFilesLabel>
        <UploadFiles onChange={onChange} />
        {hasError && (
          <ErrorContainer>
            <IcoWarning16 color="error" />
            <Typography variant="body-3" color="error">
              {t('required')}
            </Typography>
          </ErrorContainer>
        )}
        <Typography variant="caption-4" color="tertiary">
          {t('disclaimer')}
        </Typography>
      </Container>
      <Divider />
    </>
  );
};

const UploadFilesLabel = styled.div`
  ${({ theme }) => css`
    display: flex;
    gap: ${theme.spacing[2]};
  `}
`;

const ErrorContainer = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    gap: ${theme.spacing[3]};
  `}
`;

const Container = styled.div`
  ${({ theme }) => css`
    display: grid;
    gap: ${theme.spacing[4]};
  `}
`;

export default UploadComplianceLetter;
