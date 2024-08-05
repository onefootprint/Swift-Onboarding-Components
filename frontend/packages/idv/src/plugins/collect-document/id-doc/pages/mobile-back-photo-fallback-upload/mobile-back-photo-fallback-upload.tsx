import { IcoClock40 } from '@onefootprint/icons';
import { motion } from 'framer-motion';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import { DocumentUploadSettings } from '@onefootprint/types';
import { HeaderTitle, NavigationHeader } from '../../../../../components';
import IdDocPhotoButtons from '../../../components/id-doc-photo-buttons';
import type { CaptureKind } from '../../../types';
import { useIdDocMachine } from '../../components/machine-provider';
import docTypeTranslationKeyMap from '../../utils/doc-type-translation-key-map';

const MobileBackPhotoFallbackUpload = () => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'document-flow.id-doc.pages.mobile-back-photo-fallback-upload',
  });
  const [state, send] = useIdDocMachine();

  const {
    idDoc: { type: docType },
    hasBadConnectivity,
    requirement,
  } = state.context;

  if (!docType) return null;
  const allowPdf = requirement.uploadSettings === DocumentUploadSettings.preferUpload;

  const onComplete = (payload: {
    imageFile: File | Blob;
    extraCompressed: boolean;
    captureKind: CaptureKind;
  }) =>
    send({
      type: 'receivedImage',
      payload,
    });

  const handleClickBack = () => {
    send({ type: 'navigatedToPrev' });
  };

  const translationKey = docTypeTranslationKeyMap[docType];
  const subtitle = t(`subtitle.${translationKey}` as unknown as TemplateStringsArray) as unknown as string;

  return (
    <Container initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 0.3 } }} exit={{ opacity: 0 }}>
      <NavigationHeader leftButton={{ variant: 'back', onBack: handleClickBack }} position="floating" />
      <HeaderTitle title={t('title')} subtitle={subtitle} icon={IcoClock40} />
      <IdDocPhotoButtons
        onComplete={onComplete}
        allowPdf={allowPdf}
        hideCaptureButton
        uploadFirst
        hasBadConnectivity={hasBadConnectivity}
      />
    </Container>
  );
};

const Container = styled(motion.div)`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    flex: 1;
    padding: ${theme.spacing[5]};
    gap: ${theme.spacing[5]};
  `};
`;

export default MobileBackPhotoFallbackUpload;
