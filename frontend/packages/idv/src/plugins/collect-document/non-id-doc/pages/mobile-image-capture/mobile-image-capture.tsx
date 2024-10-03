import { useToast } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

import upperFirst from 'lodash/upperFirst';
import PhotoCapture from '../../../components/photo-capture';
import type { ReceivedImagePayload } from '../../../types';
import { useNonIdDocMachine } from '../../components/machine-provider';
import useDocName from '../../hooks/use-doc-name';

const OUTLINE_HEIGHT_RATIO = 0.9;
const OUTLINE_WIDTH_RATIO = 0.9;

const MobileImageCapture = () => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'document-flow.non-id-doc.pages.mobile-image-capture',
  });
  const [state, send] = useNonIdDocMachine();
  const { hasBadConnectivity, orgId, requirement } = state.context;
  const toast = useToast();
  const docName = useDocName(requirement.config);

  const onComplete = (payload: ReceivedImagePayload) => send({ type: 'receivedDocument', payload });

  const handleClickBack = () => {
    send({ type: 'navigatedToPrev' });
  };

  const handleCameraError = () => {
    send({ type: 'cameraErrored' });
  };

  const handleCameraStuck = () => {
    toast.show({
      title: t('camera-stuck.title'),
      description: t('camera-stuck.description'),
      variant: 'error',
    });
    send({ type: 'cameraStuck' });
  };

  return (
    <PhotoCapture
      autocaptureKind="nonIdDoc"
      cameraKind="back"
      deviceKind="mobile"
      docName={docName}
      orgId={orgId}
      requirement={requirement}
      hasBadConnectivity={hasBadConnectivity}
      onCameraErrored={handleCameraError}
      onCameraStuck={handleCameraStuck}
      onComplete={onComplete}
      onBack={handleClickBack}
      outlineHeightRatio={OUTLINE_HEIGHT_RATIO}
      outlineWidthRatio={OUTLINE_WIDTH_RATIO}
      title={{
        camera: upperFirst(docName),
        preview: upperFirst(docName),
      }}
    />
  );
};

export default MobileImageCapture;
