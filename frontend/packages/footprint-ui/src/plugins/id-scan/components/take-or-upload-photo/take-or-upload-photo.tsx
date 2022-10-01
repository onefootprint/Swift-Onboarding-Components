import { useTranslation } from '@onefootprint/hooks';
import { Button } from '@onefootprint/ui';
import React, { useState } from 'react';
import styled, { css } from 'styled-components';

import { HeaderTitle } from '../../../../components';
import MissingPermissions from '../missing-permissions';
import Camera from './components/camera';
import Prompt from './components/prompt/prompt';
import UploadPreview from './components/upload-preview/upload-preview';

type TakeOrUploadPhotoProps = {
  title: string;
  subtitle: string;
  showGuidelines?: boolean;
  onComplete: (image: string) => void;
};

enum Mode {
  take = 'take',
  upload = 'upload',
}

const convertImageBlobToBase64 = (image: Blob) =>
  new Promise(resolve => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      resolve(base64);
    };
    reader.readAsDataURL(image);
  });

const TakeOrUploadPhoto = ({
  title,
  subtitle,
  showGuidelines,
  onComplete,
}: TakeOrUploadPhotoProps) => {
  const { t } = useTranslation('components.take-or-upload-photo');
  const [image, setImage] = useState<Blob | undefined>();
  const [mode, setMode] = useState<Mode | undefined>();
  const [missingCameraPermissions, setMissingCameraPermissions] =
    useState(false);
  const [missingLibraryPermissions, setMissingLibraryPermissions] =
    useState(false);
  const hasMissingPermission =
    missingCameraPermissions || missingLibraryPermissions;
  const missingPermissionName = missingCameraPermissions
    ? t('camera-permission-name')
    : t('photo-lib-permission-name');

  const handleCloseMissingPermissions = () => {
    setMissingCameraPermissions(false);
    setMissingLibraryPermissions(false);
  };

  const handleCameraError = () => {
    // https://linear.app/footprint/issue/FP-1444/handle-different-usermedia-errors-beyond-missing-permissions
    // TODO: handle different errors differently
    // For now assume it is all because of missing permissions
    setMode(undefined);
    setMissingCameraPermissions(true);
  };

  const handleUpload = () => {
    // https://linear.app/footprint/issue/FP-1441/implement-photo-upload-logic
    // TODO: implement upload, for now, just show missing permissions
    setMissingLibraryPermissions(true);
    // setMode(Mode.upload);
  };

  const handleSubmit = async () => {
    if (!image) {
      return;
    }
    const imageString = (await convertImageBlobToBase64(image)) as string;
    onComplete(imageString);
  };

  return (
    <Container>
      <HeaderTitle title={title} subtitle={subtitle} />
      {!mode && (
        <Prompt
          onSelectTake={() => setMode(Mode.take)}
          onSelectUpload={handleUpload}
          showGuidelines={showGuidelines}
        />
      )}
      {mode === Mode.take && (
        <Camera
          onError={handleCameraError}
          onCapture={setImage}
          onClear={() => setImage(undefined)}
        />
      )}
      {mode === Mode.upload && image && (
        <UploadPreview
          src={URL.createObjectURL(image)}
          onReupload={handleUpload}
        />
      )}
      {mode && image && (
        <Button onClick={handleSubmit} fullWidth>
          {t('continue')}
        </Button>
      )}
      {hasMissingPermission && (
        <MissingPermissions
          permissionName={missingPermissionName}
          open={hasMissingPermission}
          onClose={handleCloseMissingPermissions}
        />
      )}
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    row-gap: ${theme.spacing[7]}px;
    justify-content: center;
    align-items: center;

    > button {
      margin-top: -${theme.spacing[4]}px;
    }
  `}
`;

export default TakeOrUploadPhoto;
