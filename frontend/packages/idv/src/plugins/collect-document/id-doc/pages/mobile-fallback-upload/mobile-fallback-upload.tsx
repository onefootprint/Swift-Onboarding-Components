import { IcoClock40 } from '@onefootprint/icons';
import { useTranslation } from 'react-i18next';

import { HeaderTitle, NavigationHeader } from '@/idv/components';
import { DocumentUploadSettings, type IdDocImageTypes, type SupportedIdDocTypes } from '@onefootprint/types';
import { motion } from 'framer-motion';
import { css, styled } from 'styled-components';
import IdDocPhotoButtons from '../../../components/id-doc-photo-buttons';
import { isFront, isSelfie } from '../../../utils/capture';
import { useIdDocMachine } from '../../components/machine-provider';
import docTypeTranslationKeyMap from '../../utils/doc-type-translation-key-map';

type Sides = 'front' | 'back';
type KeysOfIdDocTypes = keyof typeof SupportedIdDocTypes;
type SubtitlePaths = `mobile-${Sides}-photo-fallback-upload.subtitle.${KeysOfIdDocTypes}`;

type MobileFallbackUploadProps = {
  imageType: `${IdDocImageTypes}`;
  onTakePhotoClick?: () => void;
};

const getTitle = (imageType: `${IdDocImageTypes}`) => {
  if (isSelfie(imageType)) return 'mobile-selfie-fallback-upload.title';
  if (isFront(imageType)) return 'mobile-front-photo-fallback-upload.title';
  return 'mobile-back-photo-fallback-upload.title';
};

const getSubtitle = (docType: `${SupportedIdDocTypes}`, imageType: `${IdDocImageTypes}`): SubtitlePaths => {
  const lastKey = docTypeTranslationKeyMap[docType];
  return isFront(imageType)
    ? `mobile-front-photo-fallback-upload.subtitle.${lastKey}`
    : `mobile-back-photo-fallback-upload.subtitle.${lastKey}`;
};

const MobileFallbackUpload = ({ imageType, onTakePhotoClick }: MobileFallbackUploadProps) => {
  const { t } = useTranslation('idv', { keyPrefix: 'document-flow.id-doc.pages' });
  const [state, send] = useIdDocMachine();
  const { hasBadConnectivity, idDoc, requirement } = state.context;
  const allowPdf = requirement.uploadSettings === DocumentUploadSettings.preferUpload;

  const subtitle =
    idDoc.type && !isSelfie(imageType)
      ? t(getSubtitle(idDoc.type, imageType))
      : t('mobile-selfie-fallback-upload.subtitle');

  if (!subtitle) return null;

  return (
    <FlexColumnMotionContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.3 } }}
      exit={{ opacity: 0 }}
    >
      <NavigationHeader
        leftButton={{ variant: 'back', onBack: () => send({ type: 'navigatedToPrev' }) }}
        position="floating"
      />
      <HeaderTitle
        title={t(getTitle(imageType))}
        subtitle={subtitle}
        icon={IcoClock40}
        display="flex"
        flexDirection="column"
      />
      <IdDocPhotoButtons
        onComplete={payload => send({ type: 'receivedImage', payload })}
        allowPdf={allowPdf}
        hideCaptureButton
        uploadFirst
        hasBadConnectivity={hasBadConnectivity}
        onTakePhoto={onTakePhotoClick}
      />
    </FlexColumnMotionContainer>
  );
};

export const FlexColumnMotionContainer = styled(motion.div)`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex: 1;
    height: 100%;
    gap: ${theme.spacing[5]};
    padding: ${theme.spacing[5]};
  `}
`;

export default MobileFallbackUpload;
