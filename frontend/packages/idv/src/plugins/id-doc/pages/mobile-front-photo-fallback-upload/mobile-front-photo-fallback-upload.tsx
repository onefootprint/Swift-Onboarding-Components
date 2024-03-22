import { IcoClock40 } from '@onefootprint/icons';
import { motion } from 'framer-motion';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import { HeaderTitle, NavigationHeader } from '../../../../components';
import IdDocPhotoButtons from '../../components/id-doc-photo-buttons';
import { useIdDocMachine } from '../../components/machine-provider';
import docTypeTranslationKeyMap from '../../utils/doc-type-translation-key-map';
import type { CaptureKind } from '../../utils/state-machine';

const MobileFrontPhotoFallbackUpload = () => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'id-doc.pages.mobile-front-photo-fallback-upload',
  });
  const [state, send] = useIdDocMachine();

  const {
    idDoc: { type: docType },
  } = state.context;

  if (!docType) return null;

  const onComplete = (
    imageFile: File | Blob,
    extraCompressed: boolean,
    captureKind: CaptureKind,
  ) =>
    send({
      type: 'receivedImage',
      payload: {
        imageFile,
        extraCompressed,
        captureKind,
      },
    });

  const handleClickBack = () => {
    send({ type: 'navigatedToPrev' });
  };

  const translationKey = docTypeTranslationKeyMap[docType];
  const subtitle = t(
    `subtitle.${translationKey}` as unknown as TemplateStringsArray,
  ) as unknown as string;

  return (
    <Container
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.3 } }}
      exit={{ opacity: 0 }}
    >
      <NavigationHeader
        leftButton={{ variant: 'back', onBack: handleClickBack }}
        position="floating"
      />
      <HeaderTitle title={t('title')} subtitle={subtitle} icon={IcoClock40} />
      <IdDocPhotoButtons
        onComplete={onComplete}
        hideCaptureButton
        uploadFirst
      />
    </Container>
  );
};

const Container = styled(motion.div)`
  ${({ theme }) => css`
    flex-direction: column;
    align-items: center;
    justify-content: center;
    display: flex;
    height: 100%;
    flex: 1;
    padding: ${theme.spacing[5]};
    gap: ${theme.spacing[5]};
  `}
`;

export default MobileFrontPhotoFallbackUpload;
