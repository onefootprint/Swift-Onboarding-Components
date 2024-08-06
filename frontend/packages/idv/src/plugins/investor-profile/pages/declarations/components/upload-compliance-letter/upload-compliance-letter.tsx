import { IcoFileText24, IcoWarning16 } from '@onefootprint/icons';
import { Divider, Grid, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import UploadFiles from './components/upload-files';

type UploadComplianceLetterProps = {
  hasError?: boolean;
  onChange: (files: File[]) => void;
  selectedFiles?: File[];
};

const UploadComplianceLetter = ({ hasError, onChange, selectedFiles }: UploadComplianceLetterProps) => {
  const { t } = useTranslation('idv', { keyPrefix: 'investor-profile.pages.declarations.doc-upload' });

  return (
    <>
      <Divider />
      <Grid.Container gap={4}>
        <UploadFilesLabel>
          <IcoFileText24 />
          <Text variant="label-3" color="secondary">
            {t('label')}
          </Text>
        </UploadFilesLabel>
        <UploadFiles selectedFiles={selectedFiles} onChange={onChange} />
        {hasError && (
          <ErrorContainer>
            <IcoWarning16 color="error" />
            <Text variant="body-3" color="error">
              {t('required')}
            </Text>
          </ErrorContainer>
        )}
        <Text variant="caption-4" color="tertiary">
          {t('disclaimer')}
        </Text>
      </Grid.Container>
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

export default UploadComplianceLetter;
