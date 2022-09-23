import { useTranslation } from 'hooks';
import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import { Button } from 'ui';

import { HeaderTitle } from '../../../../components';
import MissingPermissions from '../missing-permissions';
import ScanGuidelines from '../scan-guidelines';

type TakeOrUploadPhotoProps = {
  title: string;
  subtitle: string;
  showGuidelines?: boolean;
  onComplete: (image: string) => void;
};

enum SelectionType {
  take,
  upload,
}

const TakeOrUploadPhoto = ({
  title,
  subtitle,
  showGuidelines,
  onComplete,
}: TakeOrUploadPhotoProps) => {
  const { t } = useTranslation('components.take-or-upload-photo');
  const [missingCameraPermissions, setMissingCameraPermissions] =
    useState(false);
  const [missingLibraryPermissions, setMissingLibraryPermissions] =
    useState(false);
  const hasMissingPermission =
    missingCameraPermissions || missingLibraryPermissions;
  const missingPermissionName = missingCameraPermissions
    ? t('camera-permission-name')
    : t('photo-lib-permission-name');

  const checkIfMissingPermissions = (selection: SelectionType) => {
    if (selection === SelectionType.take) {
      setMissingCameraPermissions(true);
    } else {
      setMissingLibraryPermissions(true);
    }
    // TODO: Check if missing permissions
    return true;
  };

  const handleSelection = (selection: SelectionType) => {
    const isMissing = checkIfMissingPermissions(selection);
    if (isMissing) {
      return;
    }

    // TODO: Send back the photo received
    onComplete('');
  };

  const handleCloseMissingPermissions = () => {
    setMissingCameraPermissions(false);
    setMissingLibraryPermissions(false);
  };

  return (
    <>
      <Container>
        <HeaderTitle title={title} subtitle={subtitle} />
        {showGuidelines && <ScanGuidelines />}
        <ButtonsContainer>
          <Button
            onClick={() => {
              handleSelection(SelectionType.take);
            }}
          >
            {t('take')}
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              handleSelection(SelectionType.upload);
            }}
          >
            {t('upload')}
          </Button>
        </ButtonsContainer>
      </Container>
      {hasMissingPermission && (
        <MissingPermissions
          permissionName={missingPermissionName}
          open={hasMissingPermission}
          onClose={handleCloseMissingPermissions}
        />
      )}
    </>
  );
};

const ButtonsContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    row-gap: ${theme.spacing[4]}px;

    > * {
      width: 100%;
    }
  `}
`;

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    row-gap: ${theme.spacing[7]}px;
    justify-content: center;
    align-items: center;
  `}
`;

export default TakeOrUploadPhoto;
